export function WealthCard(): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Total Wealth
      </p>
      <div className="flex items-end gap-3">
        <span className="font-number text-3xl font-bold text-[#fcd535]">₫1,240,000,000</span>
        <span className="mb-1 text-sm text-[#0ecb81]">▲ +2.4% this month</span>
      </div>
    </div>
  );
}
