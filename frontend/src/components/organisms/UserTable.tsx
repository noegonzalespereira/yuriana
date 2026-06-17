import { TableActions } from "@/components/atoms/TableActions";
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
            <th className="px-4 py-2.5">Nombre</th>
            <th className="px-4 py-2.5">Correo</th>
            <th className="px-4 py-2.5">Rol</th>
            <th className="px-4 py-2.5 text-center">Estado</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {users.map((user) => (
            <tr key={user.id_usuario} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2.5 font-bold text-[var(--yuriana-base-gray-dark)]">{user.nombre}</td>
              <td className="px-4 py-2.5 text-gray-500 text-xs font-medium">{user.correo}</td>
              <td className="px-4 py-2.5 text-[var(--yuriana-base-gray-dark)] font-black text-xs uppercase tracking-wider">{user.rol?.nombre}</td>
              <td className="px-4 py-2.5 text-center">
                <UserStatusBadge status={user.estado} />
              </td>
              <td className="px-4 py-2.5">
                <TableActions
                  onView={onView ? () => onView(user.id_usuario) : undefined}
                  onEdit={onEdit ? () => onEdit(user.id_usuario) : undefined}
                  onDelete={onDelete ? () => onDelete(user.id_usuario) : undefined}
                  size={18}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};