import { Eye, Pencil, Trash2 } from "lucide-react";
import { UserStatusBadge } from "../atoms/UserStatusBadge";
import { User } from "@/types/auth.types"; // Usamos el tipo real del backend

interface UserTableProps {
  users: User[]; // Sincronizado
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

export const UserTable = ({ users, onEdit, onDelete, onView }: UserTableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-yuriana-orange text-white uppercase text-sm font-bold">
            <th className="px-6 py-4">Nombre</th>
            <th className="px-6 py-4">Correo</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4 text-center">Estado</th>
            <th className="px-6 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.map((user) => (
            <tr key={user.id_usuario} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-gray-700">{user.nombre}</td>
              <td className="px-6 py-4 text-gray-500">{user.correo}</td>
              {/* Accedemos a user.rol.nombre como viene de tu CreateQueryBuilder */}
              <td className="px-6 py-4 text-gray-600 font-medium">{user.rol?.nombre}</td>
              <td className="px-6 py-4 text-center">
                <UserStatusBadge status={user.estado} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onView?.(user.id_usuario)} className="text-yuriana-orange hover:scale-110">
                    <Eye size={20} />
                  </button>
                  <button onClick={() => onEdit?.(user.id_usuario)} className="text-gray-400 hover:text-blue-600 hover:scale-110">
                    <Pencil size={20} />
                  </button>
                  <button onClick={() => onDelete?.(user.id_usuario)} className="text-red-500 hover:text-red-700 hover:scale-110">
                    <Trash2 size={20} />
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