"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface ComboboxOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface Props {
  options: ComboboxOption[];
  value?: string;
  selectedOptionValue?: string | number;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  onSelect: (option: ComboboxOption) => void;
}

export const SearchableCombobox = ({
  options,
  value = "",
  selectedOptionValue,
  placeholder = "Seleccionar...",
  loading = false,
  disabled = false,
  onSelect,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
          String(o.value).toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const handleSelect = (opt: ComboboxOption) => {
    onSelect(opt);
    setOpen(false);
    setQuery("");
  };

  if (disabled) {
    return (
      <div className="w-full bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl py-2 px-3 text-xs font-medium min-h-[38px] flex items-center opacity-60">
        {value || <span className="text-[var(--yuriana-input-placeholder)]">-</span>}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full flex items-center gap-2 bg-[var(--yuriana-input-bg)] border rounded-xl py-2 px-3 text-xs font-medium text-left transition-all outline-none min-h-[38px] ${
          open
            ? "border-[var(--yuriana-base-orange)]"
            : "border-[var(--yuriana-input-border)] hover:border-[var(--yuriana-base-orange)]"
        }`}
      >
        <span className={`flex-1 truncate ${value ? "text-[var(--yuriana-input-text)]" : "text-[var(--yuriana-input-placeholder)]"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-[var(--yuriana-input-placeholder)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[var(--yuriana-input-border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--yuriana-input-border)] bg-slate-50/60">
            <Search size={12} className="text-[var(--yuriana-input-placeholder)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-xs outline-none text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)]"
            />
          </div>

          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="px-4 py-4 text-xs text-[var(--yuriana-input-placeholder)] italic text-center">
                Cargando opciones...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-4 text-xs text-[var(--yuriana-input-placeholder)] italic text-center">
                Sin resultados
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-orange-50 transition-colors group border-b border-slate-50 last:border-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[var(--yuriana-base-gray-dark)] truncate group-hover:text-[var(--yuriana-base-orange)]">
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-[var(--yuriana-input-placeholder)] truncate">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {(selectedOptionValue !== undefined ? selectedOptionValue === opt.value : value === opt.label) && (
                    <Check size={12} className="text-[var(--yuriana-base-orange)] shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
