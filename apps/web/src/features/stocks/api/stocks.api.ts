import type {
  CreateStockTransactionRequest,
  HoldingsDto,
  StockTransactionDto,
  SummaryDto,
  WinLossDto,
} from '@finance-hub/shared-api-types';
import { request } from '../../../lib/api-client';

export const stocksApi = {
  listTransactions: () => request<StockTransactionDto[]>('/stocks/transactions'),

  createTransaction: (body: CreateStockTransactionRequest) =>
    request<StockTransactionDto>('/stocks/transactions', { method: 'POST', json: body }),

  deleteTransaction: (id: string) =>
    request<void>(`/stocks/transactions/${id}`, { method: 'DELETE' }),

  getWinLoss: () => request<WinLossDto>('/stocks/win-loss'),

  getHoldings: () => request<HoldingsDto>('/stocks/holdings'),

  getSummary: () => request<SummaryDto>('/stocks/summary'),
};
