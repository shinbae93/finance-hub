import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { STOCKS_KEYS } from './use-transactions';

export function useSummary() {
  return useQuery({
    queryKey: STOCKS_KEYS.summary,
    queryFn: stocksApi.getSummary,
  });
}
