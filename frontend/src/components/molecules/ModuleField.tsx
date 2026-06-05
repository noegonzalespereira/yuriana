"use client";

interface ModuleFieldProps {
  label: string;
  name: string;
  register: any;
  rules?: object;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  error?: any;
  unit?: string;
}

export const ModuleField = ({
  label,
  name,
  register,
  rules,
  type = "text",
  disabled,
  placeholder,
  error,
  unit,
}: ModuleFieldProps) => {
  const isRequired = !!(rules as any)?.required;
  const cleanLabel = label.replace(/\s*\*$/, "");
  const showRequired = isRequired;
  const showOptional = !isRequired && !disabled;

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1 flex items-center gap-1">
        <span>{cleanLabel}</span>
        {showRequired && <span className="text-red-500 font-black">*</span>}
        {showOptional && (
          <span className="text-[var(--yuriana-input-placeholder)] font-medium text-[9px]">
            (opcional)
          </span>
        )}
      </label>
      <div className="relative">
        <input
          {...register(name, rules)}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-[var(--yuriana-input-bg)] border ${
            error
              ? "border-[var(--yuriana-input-error)] focus:border-[var(--yuriana-input-error)]"
              : "border-[var(--yuriana-input-border)] focus:border-[var(--yuriana-input-border-focus)]"
          } rounded-xl py-2 px-3 text-xs font-medium text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--yuriana-input-placeholder)] font-bold text-xs uppercase">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <span className="text-[9px] text-[var(--yuriana-input-error)] font-bold ml-1 uppercase tracking-tighter animate-in fade-in slide-in-from-top-1">
          {error.message}
        </span>
      )}
    </div>
  );
};
