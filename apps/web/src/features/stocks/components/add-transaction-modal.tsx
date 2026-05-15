import { useCreateTransaction } from '../hooks/use-transactions';
import { TransactionForm } from './transaction-form';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: Props): JSX.Element | null {
  const { mutate: create, isPending } = useCreateTransaction();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <h2 className="text-base font-semibold mb-4">Add Transaction</h2>
        <TransactionForm
          onSubmit={(data) => create(data, { onSuccess: onClose })}
          isPending={isPending}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
