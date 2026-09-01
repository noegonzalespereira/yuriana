export function parseDateOnlyBolivia(value?: string | null): Date | null {
  if (!value) return null;

  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!match) return null;

  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function getBoliviaMonthYear(value?: string | null): { mes: string; anio: number } | null {
  const fecha = parseDateOnlyBolivia(value);
  if (!fecha) return null;

  return {
    mes: (fecha.getUTCMonth() + 1).toString().padStart(2, '0'),
    anio: fecha.getUTCFullYear(),
  };
}

export function addDaysToDateString(dateValue: string, days: number): string {
  const date = parseDateOnlyBolivia(dateValue);
  if (!date) return '';

  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
