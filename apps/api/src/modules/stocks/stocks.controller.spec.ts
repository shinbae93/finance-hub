import { Test } from '@nestjs/testing';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';

const mockService = {
  listTransactions: jest.fn(),
  createTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  getWinLoss: jest.fn(),
  getHoldings: jest.fn(),
  getSummary: jest.fn(),
};

const mockUser = { id: 'u1', email: 'test@test.com', fullName: null, createdAt: new Date() };
const req = { user: mockUser };

describe('StocksController', () => {
  let controller: StocksController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StocksController],
      providers: [{ provide: StocksService, useValue: mockService }],
    }).compile();
    controller = module.get(StocksController);
    jest.clearAllMocks();
  });

  it('listTransactions delegates to service', async () => {
    mockService.listTransactions.mockResolvedValue([]);
    const result = await controller.listTransactions(req as any);
    expect(mockService.listTransactions).toHaveBeenCalledWith('u1');
    expect(result).toEqual([]);
  });

  it('createTransaction delegates to service', async () => {
    const dto = {
      ticker: 'VNM',
      type: 'MUA',
      volume: 100,
      price: 80000,
      feeRate: 0.0015,
      tradeDate: '2026-01-01',
      settlementDate: '2026-01-03',
    };
    mockService.createTransaction.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.createTransaction(req as any, dto as any);
    expect(mockService.createTransaction).toHaveBeenCalledWith('u1', dto);
  });

  it('deleteTransaction delegates to service', async () => {
    mockService.deleteTransaction.mockResolvedValue(undefined);
    await controller.deleteTransaction(req as any, 'tx-id');
    expect(mockService.deleteTransaction).toHaveBeenCalledWith('u1', 'tx-id');
  });

  it('getWinLoss delegates to service', async () => {
    mockService.getWinLoss.mockResolvedValue({ groups: [], winRate: 0, totalPnl: 0 });
    const result = await controller.getWinLoss(req as any);
    expect(mockService.getWinLoss).toHaveBeenCalledWith('u1');
  });

  it('getHoldings delegates to service', async () => {
    mockService.getHoldings.mockResolvedValue({ holdings: [], totalInvested: 0, totalFeesPaid: 0 });
    await controller.getHoldings(req as any);
    expect(mockService.getHoldings).toHaveBeenCalledWith('u1');
  });

  it('getSummary delegates to service', async () => {
    mockService.getSummary.mockResolvedValue({
      totalInvested: 0,
      totalReceived: 0,
      netCashPosition: 0,
      totalFeesPaid: 0,
      totalTaxPaid: 0,
      realizedPnl: 0,
      byTicker: [],
    });
    await controller.getSummary(req as any);
    expect(mockService.getSummary).toHaveBeenCalledWith('u1');
  });
});
