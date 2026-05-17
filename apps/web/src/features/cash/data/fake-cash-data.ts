// apps/web/src/features/cash/data/fake-cash-data.ts

export type CashTransactionType = 'IN' | 'OUT';

export interface CashTransaction {
  id: string;
  description: string;
  date: string;
  type: CashTransactionType;
  amount: number;
}

export interface CashStats {
  totalBalance: number;
  momPercent: number;
  inThisMonth: number;
  inCount: number;
  outThisMonth: number;
  outCount: number;
}

export type ChartRange = '1M' | '6M' | '1Y';

export interface ChartPoint {
  label: string;
  value: number;
}

export const CASH_STATS: CashStats = {
  totalBalance: 120_000_000,
  momPercent: 3.9,
  inThisMonth: 18_500_000,
  inCount: 3,
  outThisMonth: 14_000_000,
  outCount: 9,
};

export const CHART_DATA: Record<ChartRange, ChartPoint[]> = {
  '1M': [
    { label: 'W1', value: 100_000_000 },
    { label: 'W2', value: 105_000_000 },
    { label: 'W3', value: 103_000_000 },
    { label: 'W4', value: 112_000_000 },
    { label: 'W5', value: 115_500_000 },
    { label: 'Now', value: 120_000_000 },
  ],
  '6M': [
    { label: 'Dec', value: 80_000_000 },
    { label: 'Jan', value: 88_000_000 },
    { label: 'Feb', value: 92_000_000 },
    { label: 'Mar', value: 98_000_000 },
    { label: 'Apr', value: 110_000_000 },
    { label: 'Now', value: 120_000_000 },
  ],
  '1Y': [
    { label: 'Jun', value: 60_000_000 },
    { label: 'Aug', value: 72_000_000 },
    { label: 'Oct', value: 85_000_000 },
    { label: 'Dec', value: 80_000_000 },
    { label: 'Mar', value: 98_000_000 },
    { label: 'Now', value: 120_000_000 },
  ],
};

export const CASH_TRANSACTIONS: CashTransaction[] = [
  { id: '1', description: 'Lương tháng 5', date: 'May 1, 2025', type: 'IN', amount: 15_000_000 },
  { id: '2', description: 'Tiền nhà', date: 'May 3, 2025', type: 'OUT', amount: 5_000_000 },
  { id: '3', description: 'Hóa đơn điện thoại', date: 'May 5, 2025', type: 'OUT', amount: 300_000 },
  { id: '4', description: 'Thưởng freelance', date: 'May 8, 2025', type: 'IN', amount: 3_500_000 },
  { id: '5', description: 'Siêu thị', date: 'May 9, 2025', type: 'OUT', amount: 1_200_000 },
  { id: '6', description: 'Xăng xe', date: 'May 10, 2025', type: 'OUT', amount: 400_000 },
  { id: '7', description: 'Điện nước', date: 'May 11, 2025', type: 'OUT', amount: 650_000 },
  { id: '8', description: 'Internet', date: 'May 12, 2025', type: 'OUT', amount: 250_000 },
  {
    id: '9',
    description: 'Chuyển khoản từ bạn',
    date: 'May 14, 2025',
    type: 'IN',
    amount: 500_000,
  },
  { id: '10', description: 'Ăn uống', date: 'May 15, 2025', type: 'OUT', amount: 800_000 },
  {
    id: '11',
    description: 'Mua sắm quần áo',
    date: 'May 16, 2025',
    type: 'OUT',
    amount: 1_200_000,
  },
  { id: '12', description: 'Gym membership', date: 'May 17, 2025', type: 'OUT', amount: 500_000 },
];
