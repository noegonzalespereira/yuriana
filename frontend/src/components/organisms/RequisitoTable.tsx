"use client";
import { Eye, Pencil, Trash2, FileText, ShieldAlert, Calendar } from "lucide-react";
import { RequisitoDocumento } from "@/types/documento.types";

interface Props {
  data: RequisitoDocumento[];
  onDelete: (id: number) => void;
  onEdit: (req: RequisitoDocumento) => void;
  onView: (req: RequisitoDocumento) => void;
}

export const RequisitoTable = ({ data, onDelete, onEdit, onView }: Props) => {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-yuriana-orange text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-8 py-4">Nombre del Documento</th>
            <th className="px-6 py-4 text-center">Es Obligatorio</th>
            <th className="px-6 py-4 text-center">Requiere Vencimiento</th>
            <th className="px-8 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white font-medium text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-12 text-gray-400 italic text-sm">
                No hay requisitos configurados para esta categoría.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_requisito_documento} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-8 py-5 text-sm font-bold flex items-center gap-3 text-gray-800">
                  <div className="p-2 bg-orange-50 text-yuriana-orange rounded-xl">
                    <FileText size={18} />
                  </div>
                  {item.nombre_documento}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <span className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${item.es_obligatorio ? 'bg-yuriana-orange' : 'bg-gray-200'}`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${item.es_obligatorio ? 'translate-x-6' : ''}`} />
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <span className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${item.requiere_vencimiento ? 'bg-yuriana-orange' : 'bg-gray-200'}`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${item.requiere_vencimiento ? 'translate-x-6' : ''}`} />
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-4">
                    <button onClick={() => onView(item)} className="text-gray-400 hover:text-yuriana-orange transition-colors"><Eye size={18} /></button>
                    <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={18} /></button>
                    <button onClick={() => onDelete(item.id_requisito_documento)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};