import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  CreateStockTransactionRequest,
  FifoSellDto,
  HoldingsDto,
  StockTransactionDto,
  SummaryDto,
  WinLossDto,
  WinLossGroupDto,
} from '@finance-hub/shared-api-types';
import { PrismaService } from '../../prisma/prisma.service';

type DbTx = Awaited<ReturnType<typeof PrismaService.prototype.stockTransaction.findMany>>[number];

interface Lot {
  volume: number;
  price: number;
  fee: number;
}

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- CRUD ----------

  async listTransactions(userId: string): Promise<StockTransactionDto[]> {
    const rows = await this.prisma.stockTransaction.findMany({
      where: { userId },
      orderBy: { tradeDate: 'desc' },
    });
    return rows.map(this.toDto);
  }

  async createTransaction(
    userId: string,
    body: CreateStockTransactionRequest,
  ): Promise<StockTransactionDto> {
    const price = new Prisma.Decimal(body.price);
    const feeRate = new Prisma.Decimal(body.feeRate);
    const volume = body.volume;

    const fee = price.mul(volume).mul(feeRate).toDecimalPlaces(2);
    const tax =
      body.type === 'BAN'
        ? price.mul(volume).mul(new Prisma.Decimal('0.001')).toDecimalPlaces(2)
        : new Prisma.Decimal(0);

    const totalAmount =
      body.type === 'MUA'
        ? price.mul(volume).add(fee).toDecimalPlaces(2)
        : price.mul(volume).sub(fee).sub(tax).toDecimalPlaces(2);

    if (body.type === 'BAN') {
      const allTx = await this.prisma.stockTransaction.findMany({
        where: { userId },
        orderBy: { tradeDate: 'asc' },
      });
      const holdingsData = this.computeHoldings(allTx);
      const holding = holdingsData.holdings.find((h) => h.ticker === body.ticker.toUpperCase());
      const available = holding?.shares ?? 0;
      if (available < volume) {
        throw new UnprocessableEntityException(
          `Insufficient shares for ${body.ticker}: have ${available}, selling ${volume}`,
        );
      }
    }

    const row = await this.prisma.stockTransaction.create({
      data: {
        userId,
        tradeDate: new Date(body.tradeDate),
        settlementDate: new Date(body.settlementDate),
        ticker: body.ticker.toUpperCase(),
        type: body.type,
        volume,
        price,
        feeRate,
        fee,
        tax,
        totalAmount,
      },
    });
    return this.toDto(row);
  }

  async deleteTransaction(userId: string, id: string): Promise<void> {
    const row = await this.prisma.stockTransaction.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Transaction not found');
    await this.prisma.stockTransaction.delete({ where: { id } });
  }

  // ---------- Computed views ----------

  async getWinLoss(userId: string): Promise<WinLossDto> {
    const rows = await this.prisma.stockTransaction.findMany({
      where: { userId },
      orderBy: { tradeDate: 'asc' },
    });
    return this.computeWinLoss(rows);
  }

  async getHoldings(userId: string): Promise<HoldingsDto> {
    const rows = await this.prisma.stockTransaction.findMany({
      where: { userId },
      orderBy: { tradeDate: 'asc' },
    });
    return this.computeHoldings(rows);
  }

  async getSummary(userId: string): Promise<SummaryDto> {
    const rows = await this.prisma.stockTransaction.findMany({
      where: { userId },
      orderBy: { tradeDate: 'asc' },
    });
    return this.computeSummary(rows);
  }

  // ---------- FIFO engine (public for unit tests) ----------

  computeWinLoss(rows: DbTx[]): WinLossDto {
    const lots = new Map<string, Lot[]>();
    const groups = new Map<string, WinLossGroupDto>();

    for (const tx of rows) {
      const ticker = tx.ticker;
      const price = tx.price.toNumber();
      const fee = tx.fee.toNumber();
      const tax = tx.tax.toNumber();
      const volume = tx.volume;

      if (tx.type === 'MUA') {
        if (!lots.has(ticker)) lots.set(ticker, []);
        lots.get(ticker)!.push({ volume, price, fee });
        continue;
      }

      // BAN — FIFO consume
      const queue = lots.get(ticker) ?? [];
      let remaining = volume;
      let costBasis = 0;

      while (remaining > 0 && queue.length > 0) {
        const lot = queue[0]!;
        const consumed = Math.min(remaining, lot.volume);
        costBasis += consumed * lot.price;
        lot.volume -= consumed;
        remaining -= consumed;
        if (lot.volume === 0) queue.shift();
      }

      const avgCost = costBasis / volume;
      const pnl = (price - avgCost) * volume - fee - tax;
      const returnPct = (pnl / (avgCost * volume)) * 100;

      const sell: FifoSellDto = {
        transactionId: tx.id,
        tradeDate: tx.tradeDate.toISOString() as any,
        volume,
        sellPrice: price,
        avgCost,
        pnl,
        returnPct,
        fee,
        tax,
      };

      if (!groups.has(ticker)) {
        groups.set(ticker, { ticker, totalPnl: 0, sells: [] });
      }
      const g = groups.get(ticker)!;
      g.sells.push(sell);
      g.totalPnl += pnl;
    }

    const groupList = Array.from(groups.values());
    const totalSells = groupList.reduce((s, g) => s + g.sells.length, 0);
    const wins = groupList.reduce((s, g) => s + g.sells.filter((x) => x.pnl > 0).length, 0);
    const totalPnl = groupList.reduce((s, g) => s + g.totalPnl, 0);
    const winRate = totalSells > 0 ? (wins / totalSells) * 100 : 0;

    return { groups: groupList, winRate, totalPnl };
  }

  computeHoldings(rows: DbTx[]): HoldingsDto {
    const lots = new Map<string, Lot[]>();
    const feesByTicker = new Map<string, number>();

    for (const tx of rows) {
      const ticker = tx.ticker;
      const price = tx.price.toNumber();
      const fee = tx.fee.toNumber();
      const volume = tx.volume;

      if (!feesByTicker.has(ticker)) feesByTicker.set(ticker, 0);

      if (tx.type === 'MUA') {
        feesByTicker.set(ticker, feesByTicker.get(ticker)! + fee);
        if (!lots.has(ticker)) lots.set(ticker, []);
        lots.get(ticker)!.push({ volume, price, fee });
        continue;
      }

      // BAN — consume FIFO lots
      const queue = lots.get(ticker) ?? [];
      let remaining = volume;
      while (remaining > 0 && queue.length > 0) {
        const lot = queue[0]!;
        const consumed = Math.min(remaining, lot.volume);
        lot.volume -= consumed;
        remaining -= consumed;
        if (lot.volume === 0) queue.shift();
      }
    }

    const holdings = [];
    let totalInvested = 0;
    let totalFeesPaid = 0;

    for (const [ticker, queue] of lots.entries()) {
      const shares = queue.reduce((s, l) => s + l.volume, 0);
      if (shares === 0) continue;

      const costBasis = queue.reduce((s, l) => s + l.volume * l.price, 0);
      const avgCost = costBasis / shares;
      const invested = costBasis;
      const fees = feesByTicker.get(ticker) ?? 0;

      holdings.push({
        ticker,
        shares,
        avgCost,
        totalInvested: invested,
        totalFeesPaid: fees,
      });
      totalInvested += invested;
      totalFeesPaid += fees;
    }

    return { holdings, totalInvested, totalFeesPaid };
  }

  computeSummary(rows: DbTx[]): SummaryDto {
    const byTicker = new Map<string, { invested: number; received: number }>();
    let totalInvested = 0;
    let totalReceived = 0;
    let totalFeesPaid = 0;
    let totalTaxPaid = 0;

    for (const tx of rows) {
      const ticker = tx.ticker;
      const totalAmount = tx.totalAmount.toNumber();
      const fee = tx.fee.toNumber();
      const tax = tx.tax.toNumber();

      if (!byTicker.has(ticker)) byTicker.set(ticker, { invested: 0, received: 0 });
      const t = byTicker.get(ticker)!;

      totalFeesPaid += fee;
      totalTaxPaid += tax;

      if (tx.type === 'MUA') {
        totalInvested += totalAmount;
        t.invested += totalAmount;
      } else {
        totalReceived += totalAmount;
        t.received += totalAmount;
      }
    }

    const wl = this.computeWinLoss(rows);

    return {
      totalInvested,
      totalReceived,
      netCashPosition: totalReceived - totalInvested,
      totalFeesPaid,
      totalTaxPaid,
      realizedPnl: wl.totalPnl,
      byTicker: Array.from(byTicker.entries()).map(([ticker, v]) => ({
        ticker,
        totalInvested: v.invested,
        totalReceived: v.received,
      })),
    };
  }

  // ---------- Mapper ----------

  private toDto(row: DbTx): StockTransactionDto {
    return {
      id: row.id,
      tradeDate: row.tradeDate.toISOString() as any,
      settlementDate: row.settlementDate.toISOString() as any,
      ticker: row.ticker,
      type: row.type as any,
      volume: row.volume,
      price: row.price.toNumber(),
      feeRate: row.feeRate.toNumber(),
      fee: row.fee.toNumber(),
      tax: row.tax.toNumber(),
      totalAmount: row.totalAmount.toNumber(),
      createdAt: row.createdAt.toISOString() as any,
    };
  }
}
