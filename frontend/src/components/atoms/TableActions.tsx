import { Eye, Pencil, Trash2 } from "lucide-react";

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  deleteDisabled?: boolean;
  size?: number;
}

export const TableActions = ({
  onView,
  onEdit,
  onDelete,
  disabled = false,
  deleteDisabled = false,
  size = 18,
}: TableActionsProps) => (
  <div className="flex items-center justify-center gap-4">
    {onView && (
      <button
        type="button"
        onClick={onView}
        disabled={disabled}
        title="Ver detalles"
        className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform disabled:opacity-40 disabled:pointer-events-none"
      >
        <Eye size={size} />
      </button>
    )}
    {onEdit && (
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        title="Editar"
        className="text-[var(--yuriana-input-placeholder)] hover:text-slate-600 hover:scale-110 transition-transform disabled:opacity-40 disabled:pointer-events-none"
      >
        <Pencil size={size} />
      </button>
    )}
    {onDelete && (
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled || deleteDisabled}
        title="Eliminar"
        className="text-[var(--yuriana-base-black)] hover:text-[var(--yuriana-input-error)] hover:scale-110 transition-transform disabled:opacity-40 disabled:pointer-events-none"
      >
        <Trash2 size={size} />
      </button>
    )}
  </div>
);
