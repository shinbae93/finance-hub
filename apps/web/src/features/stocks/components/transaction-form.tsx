import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateStockTransactionRequest } from '@finance-hub/shared-api-types';

const schema = z.object({
  tradeDate: z.string().min(1, 'Required'),
  settlementDate: z.string().min(1, 'Required'),
  ticker: z
    .string()
    .min(2, 'Min 2 characters')
    .max(10)
    .transform((v) => v.toUpperCase()),
  type: z.enum(['MUA', 'BAN']),
  volume: z.coerce.number().int().min(1, 'Must be at least 1'),
  price: z.coerce.number().min(0, 'Must be non-negative'),
  feeRate: z.coerce.number().min(0).max(1),
});

type FormValues = z.input<typeof schema>;
type ParsedValues = z.output<typeof schema>;

interface Props {
  onSubmit: (data: CreateStockTransactionRequest) => void;
  isPending: boolean;
  onCancel: () => void;
}

export function TransactionForm({ onSubmit, isPending, onCancel }: Props): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, ParsedValues>({
    resolver: zodResolver(schema),
    defaultValues: { feeRate: 0.0015, type: 'MUA' },
  });

  const volume = Number(watch('volume') ?? 0);
  const price = Number(watch('price') ?? 0);
  const feeRate = Number(watch('feeRate') ?? 0.0015);
  const type = watch('type');

  const fee = Math.round(volume * price * feeRate);
  const tax = type === 'BAN' ? Math.round(volume * price * 0.001) : 0;
  const total = type === 'MUA' ? volume * price + fee : volume * price - fee - tax;

  function formatNum(n: number): string {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('vi-VN');
  }

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Trade Date</label>
          <input
            type="date"
            {...register('tradeDate')}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
          {errors.tradeDate && (
            <p className="text-xs text-red-500 mt-1">{errors.tradeDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Settlement Date</label>
          <input
            type="date"
            {...register('settlementDate')}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
          {errors.settlementDate && (
            <p className="text-xs text-red-500 mt-1">{errors.settlementDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Ticker</label>
          <input
            {...register('ticker')}
            placeholder="VNM"
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm uppercase"
          />
          {errors.ticker && <p className="text-xs text-red-500 mt-1">{errors.ticker.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="MUA">Mua (Buy)</option>
            <option value="BAN">Bán (Sell)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Volume</label>
          <input
            type="number"
            {...register('volume')}
            placeholder="1000"
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
          {errors.volume && <p className="text-xs text-red-500 mt-1">{errors.volume.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Price (₫)</label>
          <input
            type="number"
            {...register('price')}
            placeholder="85000"
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Fee Rate (e.g. 0.0015 for 0.15%)
        </label>
        <input
          type="number"
          step="0.0001"
          {...register('feeRate')}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      {/* Computed preview */}
      <div className="rounded bg-muted p-3 text-sm space-y-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Fee:</span>
          <span>{formatNum(fee)} ₫</span>
        </div>
        {type === 'BAN' && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (TNCN 0.1%):</span>
            <span>{formatNum(tax)} ₫</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
          <span>{type === 'MUA' ? 'Total to pay:' : 'Total received:'}</span>
          <span className="text-primary">{formatNum(total)} ₫</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}
