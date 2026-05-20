import { FilterSelect } from "../atoms/FilterSelect";
import { Rol, EstadoUsuario } from "@/types/auth.types";

interface UserFilterBarProps {
  roles: Rol[];
  onRolChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export const UserFilterBar = ({ roles, onRolChange, onEstadoChange }: UserFilterBarProps) => {
  const estadoOptions = [
    { value: EstadoUsuario.ACTIVO, label: "Activo" },
    { value: EstadoUsuario.INACTIVO, label: "Inactivo" },
  ];

  const rolOptions = roles.map(r => ({ value: r.nombre, label: r.nombre }));

  return (
    <div className="flex justify-end gap-4 mb-4">
      <FilterSelect 
        placeholder="Filtrar por Rol" 
        options={rolOptions} 
        onChange={onRolChange} 
      />
      <FilterSelect 
        placeholder="Filtrar por Estado" 
        options={estadoOptions} 
        onChange={onEstadoChange} 
      />
    </div>
  );
};