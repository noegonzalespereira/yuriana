export function parseDateOnlyBolivia(value?: string | null): Date | null {
  if (!value) return null;

  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!match) return null;

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function getBoliviaMonthYear(value?: string | null): { mes: string; anio: number } | null {
  if (!value) return null;
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!match) return null;

  const [year, month] = match.slice(1, 3);
  return {
    mes: month,
    anio: Number(year),
  };
}

export function addDaysToDateString(dateValue: string, days: number): string {
  const date = parseDateOnlyBolivia(dateValue);
  if (!date) return '';

  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}
