import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type Range = '1M' | '6M' | '1Y';

const DATA: Record<Range, { month: string; value: number }[]> = {
  '1M': [
    { month: 'W1', value: 1100 },
    { month: 'W2', value: 1130 },
    { month: 'W3', value: 1120 },
    { month: 'W4', value: 1170 },
    { month: 'W5', value: 1155 },
    { month: 'Now', value: 1240 },
  ],
  '6M': [
    { month: 'Jan', value: 900 },
    { month: 'Feb', value: 960 },
    { month: 'Mar', value: 920 },
    { month: 'Apr', value: 1050 },
    { month: 'May', value: 1100 },
    { month: 'Now', value: 1240 },
  ],
  '1Y': [
    { month: 'Jun', value: 700 },
    { month: 'Aug', value: 780 },
    { month: 'Oct', value: 850 },
    { month: 'Dec', value: 920 },
    { month: 'Mar', value: 1050 },
    { month: 'Now', value: 1240 },
  ],
};

const RANGES: Range[] = ['1M', '6M', '1Y'];

function ChartTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#2b3139] bg-[#2b3139] px-3 py-2 text-xs">
      <p className="text-[#929aa5]">{label}</p>
      <p className="font-number font-semibold text-[#eaecef]">
        ₫{((payload[0].value ?? 0) * 1_000_000).toLocaleString('vi-VN')}
      </p>
    </div>
  );
}

export function AssetHistoryChart(): JSX.Element {
  const [range, setRange] = useState<Range>('6M');
  const data = DATA[range];

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[#929aa5]">
          Total Assets Over Time
        </p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-[#fcd535] text-[#181a20]'
                  : 'bg-[#2b3139] text-[#eaecef] hover:bg-[#353d47]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fcd535" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#fcd535" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2b3139" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#707a8a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#fcd535"
              strokeWidth={1.5}
              fill="url(#assetGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#fcd535', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
