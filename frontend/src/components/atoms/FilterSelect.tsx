interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  placeholder: string;
  options: Option[];
  onChange: (value: string) => void;
}

export const FilterSelect = ({ placeholder, options, onChange }: FilterSelectProps) => {
  return (
    <select 
      onChange={(e) => onChange(e.target.value)}
      className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] text-[var(--yuriana-base-black)] text-sm rounded-xl px-4 py-2 outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors cursor-pointer shadow-sm font-medium"
    >
      <option value="" className="text-[var(--yuriana-input-placeholder)]">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-[var(--yuriana-base-black)]">
          {opt.label}
        </option>
      ))}
    </select>
  );
};