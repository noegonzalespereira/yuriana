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
        <input type="date" value={fechaInicio} onChange={(e) => onFechaInicioChange(e.target.value)} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <span className={labelClass}>Fecha Fin</span>
        <input type="date" value={fechaFin} onChange={(e) => onFechaFinChange(e.target.value)} className={inputClass} />
      </div>
    </>
  );
};