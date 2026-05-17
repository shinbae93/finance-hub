// apps/web/src/features/gold/components/add-gold-transaction-modal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['MUA', 'BAN']),
  weightGrams: z.coerce.number().positive('Weight must be positive'),
  pricePerGram: z.coerce.number().positive('Price must be positive'),
});

type FormValues = z.infer<typeof schema>;

export function AddGoldTransactionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element | null {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { type: 'MUA' as const },
  });

  const weight = watch('weightGrams') ?? 0;
  const price = watch('pricePerGram') ?? 0;
  const total = Number(weight) * Number(price);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function onSubmit() {
    // No API yet — just close and reset
    reset();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Add Gold Transaction</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.date && <p className="mt-1 text-xs text-trading-down">{errors.date.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex gap-2">
              {(['MUA', 'BAN'] as const).map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" value={t} {...register('type')} className="accent-primary" />
                  <span
                    className={
                      t === 'MUA' ? 'text-trading-up font-medium' : 'text-trading-down font-medium'
                    }
                  >
                    {t === 'MUA' ? 'Mua' : 'Bán'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Weight (grams)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('weightGrams')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. 1.5"
            />
            {errors.weightGrams && (
              <p className="mt-1 text-xs text-trading-down">{errors.weightGrams.message}</p>
            )}
          </div>

          {/* Price per gram */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Price per gram (₫)
            </label>
            <input
              type="number"
              min="0"
              {...register('pricePerGram')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. 9200000"
            />
            {errors.pricePerGram && (
              <p className="mt-1 text-xs text-trading-down">{errors.pricePerGram.message}</p>
            )}
          </div>

          {/* Auto-computed total */}
          <div className="rounded-md bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">Total: </span>
            <span className="font-number text-sm font-semibold text-foreground">
              ₫{(total || 0).toLocaleString('vi-VN')}
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
