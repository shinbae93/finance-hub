import { Test } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { PrismaService } from '../../prisma/prisma.service';

type TxOverrides = Partial<Omit<ReturnType<typeof baseTx>, 'type'> & { type: 'MUA' | 'BAN' }>;
const makeTx = (overrides: TxOverrides) => ({ ...baseTx(), ...overrides });
function baseTx() {
  return {
    id: '1',
    userId: 'u1',
    tradeDate: new Date('2026-01-01'),
    settlementDate: new Date('2026-01-03'),
    ticker: 'VNM',
    type: 'MUA' as 'MUA' | 'BAN',
    volume: 1000,
    price: { toNumber: () => 80000 } as any,
    feeRate: { toNumber: () => 0.0015 } as any,
    fee: { toNumber: () => 120000 } as any,
    tax: { toNumber: () => 0 } as any,
    totalAmount: { toNumber: () => 80120000 } as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const prismaMock = {
  stockTransaction: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
};

describe('StocksService', () => {
  let service: StocksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [StocksService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(StocksService);
    jest.clearAllMocks();
  });

  describe('computeFifo', () => {
    it('returns empty groups when no transactions', () => {
      const result = service.computeWinLoss([]);
      expect(result.groups).toHaveLength(0);
      expect(result.winRate).toBe(0);
      expect(result.totalPnl).toBe(0);
    });

    it('computes P&L for a simple buy then sell', () => {
      const buy = makeTx({
        id: '1',
        type: 'MUA',
        volume: 1000,
        price: { toNumber: () => 80000 } as any,
        fee: { toNumber: () => 120000 } as any,
        tax: { toNumber: () => 0 } as any,
      });
      const sell = makeTx({
        id: '2',
        type: 'BAN',
        volume: 500,
        price: { toNumber: () => 100000 } as any,
        fee: { toNumber: () => 75000 } as any,
        tax: { toNumber: () => 50000 } as any,
        tradeDate: new Date('2026-01-02'),
      });
      const result = service.computeWinLoss([buy, sell]);
      expect(result.groups).toHaveLength(1);
      const group = result.groups[0]!;
      expect(group.ticker).toBe('VNM');
      expect(group.sells).toHaveLength(1);
      const s = group.sells[0]!;
      expect(s.avgCost).toBe(80000);
      // pnl = (100000 - 80000) * 500 - 75000 - 50000 = 10000000 - 125000 = 9875000
      expect(s.pnl).toBe(9875000);
      expect(result.winRate).toBe(100);
    });

    it('computes FIFO across two buy lots', () => {
      const buy1 = makeTx({
        id: '1',
        type: 'MUA',
        volume: 500,
        price: { toNumber: () => 80000 } as any,
        fee: { toNumber: () => 60000 } as any,
        tax: { toNumber: () => 0 } as any,
        tradeDate: new Date('2026-01-01'),
      });
      const buy2 = makeTx({
        id: '2',
        type: 'MUA',
        volume: 500,
        price: { toNumber: () => 90000 } as any,
        fee: { toNumber: () => 67500 } as any,
        tax: { toNumber: () => 0 } as any,
        tradeDate: new Date('2026-01-02'),
      });
      const sell = makeTx({
        id: '3',
        type: 'BAN',
        volume: 700,
        price: { toNumber: () => 100000 } as any,
        fee: { toNumber: () => 105000 } as any,
        tax: { toNumber: () => 70000 } as any,
        tradeDate: new Date('2026-01-03'),
      });
      const result = service.computeWinLoss([buy1, buy2, sell]);
      const s = result.groups[0]!.sells[0]!;
      // avgCost = (500*80000 + 200*90000) / 700 = (40000000 + 18000000) / 700 = 82857.14...
      expect(s.avgCost).toBeCloseTo(82857.14, 1);
    });

    it('reports 0 win rate when all sells are losses', () => {
      const buy = makeTx({
        id: '1',
        type: 'MUA',
        volume: 1000,
        price: { toNumber: () => 100000 } as any,
        fee: { toNumber: () => 150000 } as any,
        tax: { toNumber: () => 0 } as any,
      });
      const sell = makeTx({
        id: '2',
        type: 'BAN',
        volume: 500,
        price: { toNumber: () => 80000 } as any,
        fee: { toNumber: () => 60000 } as any,
        tax: { toNumber: () => 40000 } as any,
        tradeDate: new Date('2026-01-02'),
      });
      const result = service.computeWinLoss([buy, sell]);
      expect(result.winRate).toBe(0);
      expect(result.totalPnl).toBeLessThan(0);
    });
  });

  describe('computeHoldings', () => {
    it('returns holding after buy with no sell', () => {
      const buy = makeTx({
        id: '1',
        type: 'MUA',
        volume: 1000,
        price: { toNumber: () => 80000 } as any,
        fee: { toNumber: () => 120000 } as any,
      });
      const result = service.computeHoldings([buy]);
      expect(result.holdings).toHaveLength(1);
      expect(result.holdings[0]!.shares).toBe(1000);
      expect(result.holdings[0]!.avgCost).toBe(80000);
      expect(result.holdings[0]!.totalInvested).toBe(80000000);
      expect(result.holdings[0]!.totalFeesPaid).toBe(120000);
    });

    it('reduces shares after partial sell', () => {
      const buy = makeTx({
        id: '1',
        type: 'MUA',
        volume: 1000,
        price: { toNumber: () => 80000 } as any,
        fee: { toNumber: () => 120000 } as any,
      });
      const sell = makeTx({
        id: '2',
        type: 'BAN',
        volume: 400,
        price: { toNumber: () => 90000 } as any,
        fee: { toNumber: () => 54000 } as any,
        tax: { toNumber: () => 36000 } as any,
        tradeDate: new Date('2026-01-02'),
      });
      const result = service.computeHoldings([buy, sell]);
      expect(result.holdings[0]!.shares).toBe(600);
    });

    it('removes ticker when fully sold', () => {
      const buy = makeTx({
        id: '1',
        type: 'MUA',
        volume: 1000,
        price: { toNumber: () => 80000 } as any,
        fee: { toNumber: () => 120000 } as any,
      });
      const sell = makeTx({
        id: '2',
        type: 'BAN',
        volume: 1000,
        price: { toNumber: () => 90000 } as any,
        fee: { toNumber: () => 135000 } as any,
        tax: { toNumber: () => 90000 } as any,
        tradeDate: new Date('2026-01-02'),
      });
      const result = service.computeHoldings([buy, sell]);
      expect(result.holdings).toHaveLength(0);
    });
  });

  describe('computeSummary', () => {
    it('computes correct totals from buy and sell', () => {
      const buy = makeTx({
        id: '1',
        type: 'MUA',
        fee: { toNumber: () => 120000 } as any,
        tax: { toNumber: () => 0 } as any,
        totalAmount: { toNumber: () => 80120000 } as any,
      });
      const sell = makeTx({
        id: '2',
        type: 'BAN',
        fee: { toNumber: () => 135000 } as any,
        tax: { toNumber: () => 90000 } as any,
        totalAmount: { toNumber: () => 89775000 } as any,
        tradeDate: new Date('2026-01-02'),
      });
      const result = service.computeSummary([buy, sell]);
      expect(result.totalInvested).toBe(80120000);
      expect(result.totalReceived).toBe(89775000);
      expect(result.totalFeesPaid).toBe(255000);
      expect(result.totalTaxPaid).toBe(90000);
    });
  });
});
