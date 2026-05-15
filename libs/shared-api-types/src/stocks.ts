import type { IsoDateString } from './common';

export type TransactionType = 'MUA' | 'BAN';

export interface StockTransactionDto {
  id: string;
  tradeDate: IsoDateString;
  settlementDate: IsoDateString;
  ticker: string;
  type: TransactionType;
  volume: number;
  price: number;
  feeRate: number;
  fee: number;
  tax: number;
  totalAmount: number;
  createdAt: IsoDateString;
}

export interface CreateStockTransactionRequest {
  tradeDate: string; // ISO date string YYYY-MM-DD
  settlementDate: string; // ISO date string YYYY-MM-DD
  ticker: string;
  type: TransactionType;
  volume: number;
  price: number;
  feeRate: number; // decimal e.g. 0.0015
}

export interface FifoSellDto {
  transactionId: string;
  tradeDate: IsoDateString;
  volume: number;
  sellPrice: number;
  avgCost: number;
  pnl: number;
  returnPct: number;
  fee: number;
  tax: number;
}

export interface WinLossGroupDto {
  ticker: string;
  totalPnl: number;
  sells: FifoSellDto[];
}

export interface WinLossDto {
  groups: WinLossGroupDto[];
  winRate: number; // 0–100
  totalPnl: number;
}

export interface HoldingDto {
  ticker: string;
  shares: number;
  avgCost: number;
  totalInvested: number;
  totalFeesPaid: number;
}

export interface HoldingsDto {
  holdings: HoldingDto[];
  totalInvested: number;
  totalFeesPaid: number;
}

export interface TickerSummaryDto {
  ticker: string;
  totalInvested: number;
  totalReceived: number;
}

export interface SummaryDto {
  totalInvested: number;
  totalReceived: number;
  netCashPosition: number;
  totalFeesPaid: number;
  totalTaxPaid: number;
  realizedPnl: number;
  byTicker: TickerSummaryDto[];
}
