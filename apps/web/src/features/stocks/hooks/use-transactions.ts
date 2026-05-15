import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateStockTransactionRequest } from '@finance-hub/shared-api-types';
import { stocksApi } from '../api/stocks.api';

export const STOCKS_KEYS = {
  transactions: ['stocks', 'transactions'] as const,
  winLoss: ['stocks', 'win-loss'] as const,
  holdings: ['stocks', 'holdings'] as const,
  summary: ['stocks', 'summary'] as const,
};

export function useTransactions() {
  return useQuery({
    queryKey: STOCKS_KEYS.transactions,
    queryFn: stocksApi.listTransactions,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStockTransactionRequest) => stocksApi.createTransaction(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stocksApi.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
}
