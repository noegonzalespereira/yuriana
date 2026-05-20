import { TipoColaborador } from "@/types/colaborador.types";

export const ColaboradorTypeBadge = ({ type }: { type: TipoColaborador }) => {
  const styles = {
    [TipoColaborador.ATA]: "bg-orange-50 text-[var(--yuriana-base-orange)] border-[var(--yuriana-card-border)]",
    [TipoColaborador.DESPACHANTE]: "bg-amber-50 text-[var(--yuriana-base-yellow)] border-amber-200",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${styles[type]}`}>
      {type === TipoColaborador.ATA ? 'ATA' : 'Agencia Despachante'}
    </span>
  );
};