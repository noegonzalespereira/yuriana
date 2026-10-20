"use client";

type DateRangeFilterProps = {
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (value: string) => void;
  onFechaFinChange: (value: string) => void;
  labelClass?: string;
  inputClass?: string;
};

const LABEL_CLASS_DEFAULT = "text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]";
const INPUT_CLASS_DEFAULT = "border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

/** Dado "YYYY-MM-DD", devuelve el último día de ese mes ("" si la fecha no es válida). */
export const ultimoDiaDelMes = (fecha: string): string => {
  const [anio, mes] = fecha.split("-").map(Number);
  if (!anio || !mes) return "";
  const dia = new Date(anio, mes, 0).getDate();
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
};

export const DateRangeFilter = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  labelClass = LABEL_CLASS_DEFAULT,
  inputClass = INPUT_CLASS_DEFAULT,
}: DateRangeFilterProps) => {
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className={labelClass}>Fecha Inicio</span>
        <input type="date" value={fechaInicio} onChange={(e) => {
          const val = e.target.value;
          onFechaInicioChange(val);
          // Al elegir la fecha inicio, la fecha fin pasa al último día de ese mes
          const fin = val ? ultimoDiaDelMes(val) : "";
          if (fin) onFechaFinChange(fin);
        }} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <span className={labelClass}>Fecha Fin</span>
        <input type="date" value={fechaFin} onChange={(e) => onFechaFinChange(e.target.value)} className={inputClass} />
      </div>
    </>
  );
};