import { useState, useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipContentProps,
} from 'recharts';
import { GOLD_CHART_DATA, type GoldChartRange } from '../data/fake-gold-data';

const RANGES: GoldChartRange[] = ['1M', '6M', '1Y'];
const PRIMARY = '#fcd535';

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const rawValue = payload[0]?.value;
  const value = typeof rawValue === 'number' ? rawValue : 0;
  return (
    <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-number font-semibold text-foreground">₫{value.toLocaleString('vi-VN')}</p>
    </div>
  );
}

export function GoldChart(): JSX.Element {
  const [range, setRange] = useState<GoldChartRange>('1M');
  const uid = useId().replace(/:/g, '');
  const gradientId = `goldGradient-${uid}`;
  const data = GOLD_CHART_DATA[range];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Value Over Time
        </p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-[#fcd535] text-[#181a20]'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ minHeight: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.2} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={ChartTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={PRIMARY}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
