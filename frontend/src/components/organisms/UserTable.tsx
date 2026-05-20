import { Eye, Pencil, Trash2 } from "lucide-react";
import { UserStatusBadge } from "../atoms/UserStatusBadge";
import { User } from "@/types/auth.types";

interface UserTableProps {
  users: User[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

export const UserTable = ({ users, onEdit, onDelete, onView }: UserTableProps) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-6 py-4">Nombre</th>
            <th className="px-6 py-4">Correo</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4 text-center">Estado</th>
            <th className="px-6 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {users.map((user) => (
            <tr key={user.id_usuario} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-bold text-[var(--yuriana-base-gray-dark)]">{user.nombre}</td>
              <td className="px-6 py-4 text-gray-500 text-sm font-medium">{user.correo}</td>
              <td className="px-6 py-4 text-[var(--yuriana-base-gray-dark)] font-black text-xs uppercase tracking-wider">{user.rol?.nombre}</td>
              <td className="px-6 py-4 text-center">
                <UserStatusBadge status={user.estado} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => onView?.(user.id_usuario)} className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => onEdit?.(user.id_usuario)} className="text-[var(--yuriana-base-gray-light)] hover:text-slate-600 hover:scale-110 transition-transform">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDelete?.(user.id_usuario)} className="text-[var(--yuriana-base-error)] hover:scale-110 transition-transform">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};