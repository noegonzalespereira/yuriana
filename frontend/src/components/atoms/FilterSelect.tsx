// src/components/atoms/FilterSelect.tsx
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
      className="bg-white border-2 border-gray-100 text-gray-700 text-sm rounded-xl px-4 py-2 outline-none focus:border-yuriana-orange transition-colors cursor-pointer shadow-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};