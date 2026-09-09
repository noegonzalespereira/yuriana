import { getBoliviaMonthYear, parseDateOnlyBolivia } from './date-utils';

describe('parseDateOnlyBolivia', () => {
  it('should keep the local calendar date without shifting to the next month', () => {
    const result = parseDateOnlyBolivia('2026-08-01');

    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(7);
    expect(result!.getDate()).toBe(1);
  });

  it('should derive the correct month and year for Bolivia dates', () => {
    expect(getBoliviaMonthYear('2026-09-01')).toEqual({ mes: '09', anio: 2026 });
  });

  it('should return null for empty dates', () => {
    expect(parseDateOnlyBolivia('')).toBeNull();
    expect(parseDateOnlyBolivia(undefined)).toBeNull();
    expect(getBoliviaMonthYear('')).toBeNull();
  });
});
