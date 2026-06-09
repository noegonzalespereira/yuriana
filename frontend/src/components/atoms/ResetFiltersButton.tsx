import { RotateCcw } from "lucide-react";

interface ResetFiltersButtonProps {
  onClick: () => void;
}

export const ResetFiltersButton = ({ onClick }: ResetFiltersButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--yuriana-input-placeholder)] hover:text-[var(--yuriana-base-orange)] transition-colors border border-[var(--yuriana-input-border)] hover:border-[var(--yuriana-base-orange)] rounded-xl px-3 py-1.5 bg-[var(--yuriana-input-bg)]"
  >
    <RotateCcw size={11} />
    Restablecer
  </button>
);
