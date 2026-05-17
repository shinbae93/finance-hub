import {
  AllocationChart,
  AssetHistoryChart,
  RecentTransactions,
  WealthCard,
} from '../features/dashboard';

export function DashboardPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#eaecef]">Dashboard</h1>
      </div>

      {/* Total Wealth */}
      <WealthCard />

      {/* Middle row: allocation + chart */}
      <div className="flex gap-5">
        <AllocationChart />
        <AssetHistoryChart />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
