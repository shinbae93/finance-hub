import { toIsoDateString, isIsoDateString } from './date';

describe('toIsoDateString', () => {
  it('returns an ISO 8601 string in UTC', () => {
    const d = new Date('2026-05-14T10:00:00Z');
    expect(toIsoDateString(d)).toBe('2026-05-14T10:00:00.000Z');
  });
});

describe('isIsoDateString', () => {
  it('accepts well-formed ISO strings', () => {
    expect(isIsoDateString('2026-05-14T10:00:00.000Z')).toBe(true);
  });

  it('rejects non-ISO strings', () => {
    expect(isIsoDateString('14/05/2026')).toBe(false);
    expect(isIsoDateString('not a date')).toBe(false);
  });
});
