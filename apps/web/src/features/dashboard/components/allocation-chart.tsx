import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const ALLOCATION_DATA = [
  { name: 'Stocks', value: 45, color: '#fcd535' },
  { name: 'Cash', value: 25, color: '#0ecb81' },
  { name: 'Gold', value: 15, color: '#2dbdb6' },
  { name: 'Other', value: 15, color: '#3b82f6' },
];

export function AllocationChart(): JSX.Element {
  return (
    <div className="w-[220px] flex-shrink-0 rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#929aa5]">Allocation</p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={80} height={80}>
          <PieChart>
            <Pie
              data={ALLOCATION_DATA}
              cx="50%"
              cy="50%"
              innerRadius={24}
              outerRadius={38}
              dataKey="value"
              strokeWidth={0}
            >
              {ALLOCATION_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <ul className="flex flex-col gap-1.5">
          {ALLOCATION_DATA.map((entry) => (
            <li key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ background: entry.color }}
              />
              <span className="text-[#eaecef]">{entry.name}</span>
              <span className="ml-1 font-number font-semibold" style={{ color: entry.color }}>
                {entry.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
