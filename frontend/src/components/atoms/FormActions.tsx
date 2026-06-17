import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  isEditing?: boolean;
  entityLabel?: string;
  disabled?: boolean;
}

export const FormActions = ({
  onCancel,
  onSubmit,
  isReadOnly = false,
  isSubmitting = false,
  isEditing = false,
  entityLabel = "",
  disabled = false,
}: FormActionsProps) => {
  const submitLabel = isEditing
    ? `Actualizar${entityLabel ? ` ${entityLabel}` : ""}`
    : `Guardar${entityLabel ? ` ${entityLabel}` : ""}`;

  return (
    <div className="flex justify-end gap-4 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-10 py-4 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm uppercase tracking-wide disabled:opacity-50"
      >
        {isReadOnly ? "Cerrar" : "Cancelar"}
      </button>

      {!isReadOnly && (
        <button
          type={onSubmit ? "button" : "submit"}
          onClick={onSubmit}
          disabled={isSubmitting || disabled}
          className="px-10 py-4 bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] rounded-xl font-black hover:opacity-90 transition-all text-sm uppercase tracking-wide flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          <span>{isSubmitting ? "Guardando..." : submitLabel}</span>
        </button>
      )}
    </div>
  );
};
