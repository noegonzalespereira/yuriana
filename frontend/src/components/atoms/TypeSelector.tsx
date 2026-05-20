import { TipoColaborador } from "@/types/colaborador.types";

interface Props {
  selected: TipoColaborador;
  onChange: (type: TipoColaborador) => void;
  disabled?: boolean;
}

export const TypeSelector = ({ selected, onChange, disabled }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(TipoColaborador.ATA)}
        className={`py-6 rounded-2xl border-2 font-black transition-all text-sm uppercase tracking-widest ${
          selected === TipoColaborador.ATA 
          ? "bg-white border-[var(--yuriana-base-orange)] text-[var(--yuriana-base-gray-dark)] shadow-md" 
          : "bg-white border-slate-100 text-[var(--yuriana-base-gray-light)] opacity-60"
        }`}
      >
        ATA
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(TipoColaborador.DESPACHANTE)}
        className={`py-6 rounded-2xl border-2 font-black transition-all text-sm uppercase tracking-widest ${
          selected === TipoColaborador.DESPACHANTE 
          ? "bg-[var(--yuriana-base-yellow)] border-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] shadow-lg" 
          : "bg-white border-slate-100 text-[var(--yuriana-base-gray-light)] opacity-60"
        }`}
      >
        Agencia Despachante
      </button>
    </div>
  );
};