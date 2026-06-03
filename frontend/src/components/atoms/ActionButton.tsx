import { Plus } from "lucide-react";

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
}

export const ActionButton = ({ label, onClick }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-[var(--yuriana-base-black)] font-bold py-2 px-4 rounded-xl shadow-lg transition-transform active:scale-95 whitespace-nowrap uppercase tracking-tight text-xs"
    >
      <Plus size={20} strokeWidth={3} />
      <span>{label}</span>
    </button>
  );
};