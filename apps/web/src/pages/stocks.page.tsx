import { useState } from 'react';
import {
  useTransactions,
  useWinLoss,
  useHoldings,
  useSummary,
  TransactionTable,
  AddTransactionModal,
  WinLossList,
  HoldingsTable,
  SummaryCards,
} from '../features/stocks';
import { Button } from '@finance-hub/web-ui';

type Tab = 'transactions' | 'winloss' | 'holdings' | 'summary';

const TABS: { id: Tab; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'winloss', label: 'Win / Loss' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'summary', label: 'Summary' },
];

function Spinner(): JSX.Element {
  return (
    <div className="flex justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function QueryError({ message }: { message: string }): JSX.Element {
  return <p className="py-8 text-center text-sm text-destructive">{message}</p>;
}

export function StocksPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: transactions, isLoading: txLoading, isError: txError } = useTransactions();
  const { data: winLoss, isLoading: wlLoading, isError: wlError } = useWinLoss();
  const { data: holdings, isLoading: hLoading, isError: hError } = useHoldings();
  const { data: summary, isLoading: sLoading, isError: sError } = useSummary();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <nav className="w-40 flex-shrink-0 border-r border-border bg-card">
        <div className="px-4 py-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Stocks
        </div>
        <ul>
          {TABS.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-r-2 border-primary bg-muted font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-background p-6">
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Transactions</h2>
              <Button onClick={() => setModalOpen(true)}>+ Add Transaction</Button>
            </div>
            {txLoading ? (
              <Spinner />
            ) : txError ? (
              <QueryError message="Failed to load transactions. Please try again." />
            ) : (
              <TransactionTable transactions={transactions ?? []} />
            )}
          </div>
        )}

        {activeTab === 'winloss' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Win / Loss</h2>
            {wlLoading ? (
              <Spinner />
            ) : wlError ? (
              <QueryError message="Failed to load win/loss data. Please try again." />
            ) : winLoss ? (
              <WinLossList data={winLoss} />
            ) : null}
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Holdings</h2>
            {hLoading ? (
              <Spinner />
            ) : hError ? (
              <QueryError message="Failed to load holdings. Please try again." />
            ) : holdings ? (
              <HoldingsTable data={holdings} />
            ) : null}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Summary</h2>
            {sLoading ? (
              <Spinner />
            ) : sError ? (
              <QueryError message="Failed to load summary. Please try again." />
            ) : summary ? (
              <SummaryCards data={summary} />
            ) : null}
          </div>
        )}
      </main>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
