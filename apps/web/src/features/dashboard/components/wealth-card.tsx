export function WealthCard(): JSX.Element {
  return (
    <div className="rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#707a8a]">
        Total Wealth
      </p>
      <div className="flex items-end gap-3">
        <span className="font-number text-3xl font-bold text-[#fcd535]">₫1,240,000,000</span>
        <span className="mb-1 text-sm text-[#0ecb81]">▲ +2.4% this month</span>
      </div>
    </div>
  );
}
