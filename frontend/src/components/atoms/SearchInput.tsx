import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const SearchInput = ({ placeholder = "Buscar...", onChange }: SearchInputProps) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 bg-white border-none rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yuriana-yellow shadow-sm text-gray-900"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};