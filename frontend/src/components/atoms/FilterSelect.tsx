"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  placeholder: string;
  options: Option[];
  onChange: (value: string) => void;
  value?: string;
}

export const FilterSelect = ({ placeholder, options, onChange, value }: FilterSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider
          transition-all duration-200 cursor-pointer select-none whitespace-nowrap min-w-[130px]
          ${open || selected
            ? "bg-[var(--yuriana-base-orange)] text-white border-[var(--yuriana-base-orange)] shadow-md shadow-orange-200"
            : "bg-white text-[var(--yuriana-base-gray-dark)] border-[var(--yuriana-input-border)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)]"
          }
        `}
      >
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-[var(--yuriana-input-border)] rounded-xl shadow-xl overflow-hidden min-w-[150px] animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => handleSelect("")}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors text-left
              ${!value
                ? "bg-orange-50 text-[var(--yuriana-base-orange)]"
                : "text-[var(--yuriana-base-gray-light)] hover:bg-orange-50 hover:text-[var(--yuriana-base-orange)]"
              }
            `}
          >
            {placeholder}
            {!value && <Check size={11} className="shrink-0" />}
          </button>

          <div className="h-px bg-[var(--yuriana-input-border)] mx-2" />

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`
                w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors text-left
                ${value === opt.value
                  ? "bg-orange-50 text-[var(--yuriana-base-orange)]"
                  : "text-[var(--yuriana-base-gray-dark)] hover:bg-orange-50 hover:text-[var(--yuriana-base-orange)]"
                }
              `}
            >
              {opt.label}
              {value === opt.value && <Check size={11} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
