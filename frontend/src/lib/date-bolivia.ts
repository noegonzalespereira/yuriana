export const BOLIVIA_TIMEZONE = "America/La_Paz";

export const parseDateOnlyBolivia = (value: string | Date | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const raw = String(value).split("T")[0];
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

export const toDateInputBolivia = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "2024";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
};

export const formatDateBolivia = (value: string | Date | null | undefined) => {
  if (!value) return "-";

  const date = parseDateOnlyBolivia(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("es-BO", {
    timeZone: BOLIVIA_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const getCurrentMonthRangeBolivia = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return {
    primerDia: toDateInputBolivia(new Date(year, month, 1)),
    ultimoDia: toDateInputBolivia(new Date(year, month + 1, 0)),
  };
};
