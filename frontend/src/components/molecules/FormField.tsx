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
  <div className="space-y-1 text-left">
    <Label className="text-gray-700 text-sm font-medium ml-1">
      {label}
    </Label>
    
    <div className="flex items-center border-2 border-yuriana-orange rounded-2xl overflow-hidden bg-white group focus-within:ring-1 focus-within:ring-yuriana-orange">
      {/* Contenedor del Icono - Color Negro */}
      <div className="p-3 border-r-2 border-yuriana-orange text-black flex items-center justify-center">
        {icon}
      </div>
      
      {/* Input - Fondo Blanco y Texto Gris */}
      <Input 
        {...register}
        type={type} 
        placeholder={placeholder} 
        className="border-none focus-visible:ring-0 bg-white text-gray-600 placeholder:text-gray-400 h-12" 
      />
    </div>
  </div>
);