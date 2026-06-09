import { TipoColaborador } from "@/types/colaborador.types";

interface Props {
  selected: TipoColaborador;
  onChange: (type: TipoColaborador) => void;
  disabled?: boolean;
}

const TIPOS = [
  { value: TipoColaborador.ATA,         label: "ATA" },
  { value: TipoColaborador.DESPACHANTE, label: "Agencia Despachante" },
];

export const TypeSelector = ({ selected, onChange, disabled }: Props) => {
  return (
    <div className="flex flex-wrap gap-3">
      {TIPOS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value)}
          className={`px-5 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
            selected === value
              ? "bg-[var(--yuriana-base-yellow)] text-white border-[var(--yuriana-base-yellow)] shadow-md"
              : "bg-white text-[var(--yuriana-base-black)] border-[var(--yuriana-base-orange)] hover:bg-slate-50"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};