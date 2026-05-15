import { EstadoUsuario } from "@/types/auth.types";

interface UserStatusBadgeProps {
  status: EstadoUsuario;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const styles = {
    [EstadoUsuario.ACTIVO]: "bg-green-100 text-green-700 border-green-200",
    [EstadoUsuario.INACTIVO]: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};