// apps/web/src/features/gold/data/fake-gold-data.ts

export type GoldTransactionType = 'MUA' | 'BAN';

export interface GoldTransaction {
  id: string;
  date: string; // display string e.g. "Apr 15, 2025"
  type: GoldTransactionType;
  weightGrams: number;
  pricePerGram: number;
  total: number; // weightGrams * pricePerGram
}

export interface GoldStats {
  currentValue: number; // weight held × mock current price
  totalInvested: number; // sum of all buy totals
  sellRevenue: number; // sum of all sell totals
  realizedPnl: number; // sell revenue − cost basis of sold units
  totalPnl: number; // realizedPnl + (currentValue − cost basis of unsold units)
  currentVsCostPercent: number; // (currentValue / costBasisHeld - 1) * 100
}

export type GoldChartRange = '1M' | '6M' | '1Y';

export interface GoldChartPoint {
  label: string;
  value: number;
}

// Mock current gold price per gram (₫)
export const MOCK_PRICE_PER_GRAM = 9_500_000;

export const GOLD_TRANSACTIONS: GoldTransaction[] = [
  {
    id: '1',
    date: 'Apr 15, 2025',
    type: 'MUA',
    weightGrams: 5.0,
    pricePerGram: 9_200_000,
    total: 46_000_000,
  },
  {
    id: '2',
    date: 'Mar 2, 2025',
    type: 'BAN',
    weightGrams: 2.0,
    pricePerGram: 9_800_000,
    total: 19_600_000,
  },
  {
    id: '3',
    date: 'Jan 10, 2025',
    type: 'MUA',
    weightGrams: 3.0,
    pricePerGram: 8_500_000,
    total: 25_500_000,
  },
  {
    id: '4',
    date: 'Dec 5, 2024',
    type: 'MUA',
    weightGrams: 2.0,
    pricePerGram: 8_200_000,
    total: 16_400_000,
  },
  {
    id: '5',
    date: 'Nov 20, 2024',
    type: 'BAN',
    weightGrams: 1.0,
    pricePerGram: 8_100_000,
    total: 8_100_000,
  },
];

// Derived stats (hand-computed from GOLD_TRANSACTIONS, mock current price: ₫9,500,000 per gram):
//   Total bought: 5+3+2 = 10g for ₫87,900,000
//   Total sold:   2+1  =  3g for ₫27,700,000
//   Held: 7g  → currentValue = 7 × 9,500,000 = 66,500,000
//   Cost basis of sold 3g (FIFO from earliest buys):
//     1g from Dec buy @ 8,200,000 + 2g from Jan buy @ 8,500,000 = 8,200,000 + 17,000,000 = 25,200,000
//   realizedPnl = 27,700,000 − 25,200,000 = 2,500,000
//   Cost basis of held 7g: 87,900,000 − 25,200,000 = 62,700,000
//   totalPnl = 2,500,000 + (66,500,000 − 62,700,000) = 2,500,000 + 3,800,000 = 6,300,000
//   currentVsCostPercent = (66,500,000 / 62,700,000 − 1) × 100 ≈ 6.06%
export const GOLD_STATS: GoldStats = {
  currentValue: 66_500_000,
  totalInvested: 87_900_000,
  sellRevenue: 27_700_000,
  realizedPnl: 2_500_000,
  totalPnl: 6_300_000,
  currentVsCostPercent: 6.06,
};

export const GOLD_CHART_DATA: Record<GoldChartRange, GoldChartPoint[]> = {
  '1M': [
    { label: 'W1', value: 60_000_000 },
    { label: 'W2', value: 61_500_000 },
    { label: 'W3', value: 63_000_000 },
    { label: 'W4', value: 65_000_000 },
    { label: 'W5', value: 66_000_000 },
    { label: 'Now', value: 66_500_000 },
  ],
  '6M': [
    { label: 'Dec', value: 41_000_000 },
    { label: 'Jan', value: 50_000_000 },
    { label: 'Feb', value: 55_000_000 },
    { label: 'Mar', value: 58_000_000 },
    { label: 'Apr', value: 63_000_000 },
    { label: 'Now', value: 66_500_000 },
  ],
  '1Y': [
    { label: 'Jun', value: 20_000_000 },
    { label: 'Aug', value: 30_000_000 },
    { label: 'Oct', value: 38_000_000 },
    { label: 'Dec', value: 41_000_000 },
    { label: 'Mar', value: 58_000_000 },
    { label: 'Now', value: 66_500_000 },
  ],
};
