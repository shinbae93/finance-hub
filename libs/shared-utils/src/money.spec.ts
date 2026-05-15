import { formatMoney, parseMoney } from './money';

describe('formatMoney', () => {
  it('formats USD with two decimals by default', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });

  it('honors a different currency', () => {
    expect(formatMoney(1000, 'EUR')).toBe('€1,000.00');
  });

  it('handles zero', () => {
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('handles negatives', () => {
    expect(formatMoney(-42.1)).toBe('-$42.10');
  });
});

describe('parseMoney', () => {
  it('strips currency symbols and commas', () => {
    expect(parseMoney('$1,234.50')).toBe(1234.5);
  });

  it('returns NaN for unparseable input', () => {
    expect(Number.isNaN(parseMoney('abc'))).toBe(true);
  });

  it('handles negatives', () => {
    expect(parseMoney('-$42.10')).toBe(-42.1);
  });
});
