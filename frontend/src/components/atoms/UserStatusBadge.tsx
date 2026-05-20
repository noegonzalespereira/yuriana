import { EstadoUsuario } from "@/types/auth.types";

interface UserStatusBadgeProps {
  status: EstadoUsuario;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const styles = {
    [EstadoUsuario.ACTIVO]: "bg-green-50 text-emerald-600 border-emerald-200",
    [EstadoUsuario.INACTIVO]: "bg-red-50 text-[var(--yuriana-base-error)] border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};