import { useState } from 'react';
import { Button } from '@finance-hub/web-ui';
import {
  GoldStatCards,
  GoldChart,
  GoldTransactionTable,
  AddGoldTransactionModal,
  GOLD_STATS,
  GOLD_TRANSACTIONS,
} from '../features/gold';

export function GoldPage(): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-foreground">Gold</h2>
        <Button onClick={() => setModalOpen(true)}>+ Add Transaction</Button>
      </div>

      <GoldStatCards stats={GOLD_STATS} />
      <GoldChart />
      <GoldTransactionTable transactions={GOLD_TRANSACTIONS} />

      <AddGoldTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
