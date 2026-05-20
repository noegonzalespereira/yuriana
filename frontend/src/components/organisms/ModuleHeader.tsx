import { SearchInput } from "../atoms/SearchInput";
import { ActionButton } from "../atoms/ActionButton";

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export const ModuleHeader = ({
  title,
  subtitle,
  searchPlaceholder,
  onSearch,
  buttonLabel,
  onButtonClick,
}: ModuleHeaderProps) => {
  return (
    <div className="w-full bg-[var(--yuriana-base-orange)] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
      <div className="flex flex-col flex-1 text-left">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-white/80 text-xs mt-1 italic font-medium">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        {onSearch && (
          <SearchInput 
            placeholder={searchPlaceholder} 
            onChange={onSearch} 
          />
        )}
        
        {buttonLabel && (
          <ActionButton 
            label={buttonLabel} 
            onClick={onButtonClick} 
          />
        )}
      </div>
    </div>
  );
};