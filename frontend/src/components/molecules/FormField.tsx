import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  register: any;
}

export const FormField = ({ label, icon, type, placeholder, register }: FormFieldProps) => (
  <div className="space-y-1 text-left w-full">
    <Label className="text-[var(--yuriana-input-label)] text-sm font-medium ml-1">
      {label}
    </Label>
    
    <div className="flex items-center border-2 border-[var(--yuriana-input-border-focus)] rounded-2xl overflow-hidden bg-[var(--yuriana-input-bg)] group focus-within:ring-1 focus-within:ring-[var(--yuriana-input-border-focus)]">
      {/* Contenedor del Icono - Color Negro */}
      <div className="p-3 border-r-2 border-[var(--yuriana-input-border-focus)] text-[var(--yuriana-base-black)] flex items-center justify-center">
        {icon}
      </div>
      
      {/* Input */}
      <Input 
        {...register}
        type={type} 
        placeholder={placeholder} 
        className="border-none focus-visible:ring-0 bg-transparent text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)] h-12 w-full font-medium" 
      />
    </div>
  </div>
);