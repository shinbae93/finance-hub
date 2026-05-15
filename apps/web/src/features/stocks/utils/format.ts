export function formatNum(n: number): string {
  return Math.round(n).toLocaleString('vi-VN');
}

export function formatPnl(n: number): string {
  return (n >= 0 ? '+' : '') + formatNum(n);
}
