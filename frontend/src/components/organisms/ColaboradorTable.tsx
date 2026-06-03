// src/components/organisms/ColaboradorTable.tsx
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Colaborador } from "@/types/colaborador.types";
import { ColaboradorTypeBadge } from "../atoms/ColaboradorTypeBadge";

interface Props {
  data: Colaborador[];
  onDelete: (ci: number) => void;
  onEdit: (colab: Colaborador) => void;
  onView: (colab: Colaborador) => void;
}

export const ColaboradorTable = ({ data, onDelete, onEdit, onView }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">Colaborador</th>
            <th className="px-4 py-2.5">Tipo</th>
            <th className="px-4 py-2.5">Agencia / Ciudad</th>
            <th className="px-4 py-2.5">Teléfono</th>
            <th className="px-4 py-2.5">Monto</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.map((item) => (
            <tr key={item.id_colaborador} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2.5">
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--yuriana-base-gray-dark)] text-xs">{item.persona.nombre}</span>
                  <span className="text-[10px] text-[var(--yuriana-base-gray-light)] font-black mt-0.5">CI: {item.persona.ci}</span>
                </div>
              </td>
              <td className="px-4 py-2.5"><ColaboradorTypeBadge type={item.tipo_colaborador} /></td>
              <td className="px-4 py-2.5 text-xs font-bold">
                <div className="flex flex-col">
                  <span className="text-[var(--yuriana-base-gray-dark)]">{item.agencia}</span>
                  <span className="text-[var(--yuriana-base-gray-light)] font-medium text-[10px] mt-0.5">{item.persona.ciudad}</span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-xs text-gray-600 font-medium">{item.persona.telefono}</td>
              <td className="px-4 py-2.5 font-black text-xs text-[var(--yuriana-base-gray-dark)]">{item.monto.toLocaleString()} Bs</td>
              <td className="px-4 py-2.5">
                <div className="flex justify-center gap-4">
                  <button onClick={() => onView(item)} className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform"><Eye size={18} /></button>
                  <button onClick={() => onEdit(item)} className="text-[var(--yuriana-base-gray-light)] hover:text-slate-600 hover:scale-110 transition-transform"><Pencil size={18} /></button>
                  <button onClick={() => onDelete(item.persona.ci)} className="text-[var(--yuriana-base-error)] hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};