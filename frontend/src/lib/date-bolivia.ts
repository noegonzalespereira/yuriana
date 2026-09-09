export const BOLIVIA_TIMEZONE = "America/La_Paz";

export const parseDateOnlyBolivia = (value: string | Date | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const raw = String(value).split("T")[0];
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 12, 0, 0);
};

export const toDateInputBolivia = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateBolivia = (value: string | Date | null | undefined) => {
  if (!value) return "-";

  const date = parseDateOnlyBolivia(value);
  if (!date) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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
