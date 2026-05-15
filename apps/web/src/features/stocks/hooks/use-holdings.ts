import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { STOCKS_KEYS } from './use-transactions';

export function useHoldings() {
  return useQuery({
    queryKey: STOCKS_KEYS.holdings,
    queryFn: stocksApi.getHoldings,
  });
}
