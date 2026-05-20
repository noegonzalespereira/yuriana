// src/components/organisms/ClienteTable.tsx
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Cliente } from "@/types/cliente.types";

interface Props {
  data: Cliente[];
  onDelete: (codigo: string) => void;
  onEdit: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
}

export const ClienteTable = ({ data, onDelete, onEdit, onView }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-6 py-4">ID Cliente</th>
            <th className="px-6 py-4">Empresa</th>
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Contacto</th>
            <th className="px-6 py-4">Viajes</th>
            <th className="px-6 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.map((item) => (
            <tr key={item.id_cliente} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-black text-[var(--yuriana-base-gray-dark)] text-sm">{item.codigo_cliente}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--yuriana-base-gray-dark)] text-sm">{item.razon_social}</span>
                  <span className="text-[10px] text-[var(--yuriana-base-gray-light)] font-black uppercase mt-0.5">NIT: {item.nit}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{item.persona.nombre}</td>
              <td className="px-6 py-4 text-xs">
                <div className="flex flex-col font-bold">
                  <span className="text-[var(--yuriana-base-orange)]">{item.persona.telefono}</span>
                  <span className="text-[var(--yuriana-base-gray-light)] font-medium">{item.persona.correo}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <button className="bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] text-[10px] font-black px-4 py-2 rounded-lg hover:shadow-md transition-all uppercase tracking-wider">
                  Ver Viajes
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-4">
                  <button onClick={() => onView(item)} className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform"><Eye size={18} /></button>
                  <button onClick={() => onEdit(item)} className="text-[var(--yuriana-base-gray-light)] hover:text-slate-600 hover:scale-110 transition-transform"><Pencil size={18} /></button>
                  <button onClick={() => onDelete(item.codigo_cliente)} className="text-[var(--yuriana-base-error)] hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};