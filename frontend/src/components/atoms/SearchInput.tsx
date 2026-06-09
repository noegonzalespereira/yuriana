import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export const SearchInput = ({ placeholder = "Buscar...", onChange, value: externalValue }: SearchInputProps) => {
  const [val, setVal] = useState(externalValue ?? "");

  useEffect(() => {
    setVal(externalValue ?? "");
  }, [externalValue]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[var(--yuriana-input-placeholder)]" />
      </div>
      <input
        type="text"
        value={val}
        className="block w-full pl-9 pr-3 py-1.5 bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl text-xs placeholder-[var(--yuriana-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--yuriana-input-border-focus)] shadow-sm text-[var(--yuriana-input-text)] font-medium uppercase placeholder:uppercase"
        placeholder={placeholder}
        onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value); }}
      />
    </div>
  );
};
