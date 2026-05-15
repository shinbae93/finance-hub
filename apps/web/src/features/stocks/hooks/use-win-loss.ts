import { useQuery } from '@tanstack/react-query';
import { stocksApi } from '../api/stocks.api';
import { STOCKS_KEYS } from './use-transactions';

export function useWinLoss() {
  return useQuery({
    queryKey: STOCKS_KEYS.winLoss,
    queryFn: stocksApi.getWinLoss,
  });
}
