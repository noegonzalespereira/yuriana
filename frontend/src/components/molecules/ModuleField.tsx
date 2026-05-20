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
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          {...register(name, rules)}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-[var(--yuriana-input-bg)] border ${
            error ? "border-[var(--yuriana-input-error)] focus:border-[var(--yuriana-input-error)]" : "border-[var(--yuriana-input-border)] focus:border-[var(--yuriana-input-border-focus)]"
          } rounded-xl py-3 px-4 text-sm font-medium text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500`}
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