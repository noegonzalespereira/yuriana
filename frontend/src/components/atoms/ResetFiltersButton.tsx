import { RotateCcw } from "lucide-react";

interface ResetFiltersButtonProps {
  onClick: () => void;
}

export const ResetFiltersButton = ({ onClick }: ResetFiltersButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--yuriana-base-gray-light)] hover:text-[var(--yuriana-base-orange)] transition-all duration-200 border border-[var(--yuriana-input-border)] hover:border-[var(--yuriana-base-orange)] hover:bg-orange-50 rounded-xl px-3 py-1.5 bg-white"
  >
    <RotateCcw size={11} />
    Restablecer
  </button>
);
