"use client";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Conductor, EstadoLaboral, EstadoOperativo } from "@/types/conductor.types";
import { toast } from "sonner";

interface Props {
  data: Conductor[];
  onDelete: (ci: number) => void;
  onEdit: (conductor: Conductor) => void;
  onView: (conductor: Conductor) => void;
}

export const ConductorTable = ({ data, onDelete, onEdit, onView }: Props) => {
  
  // Optimizamos los badges para que usen exactamente tus variables globales de CSS
  const getDocBadge = (estado?: string) => {
    switch (estado) {
      case "vigente": 
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "por_vencer": 
        return "bg-amber-50 text-[var(--yuriana-base-yellow)] border-amber-200";
      case "vencido": 
        return "bg-red-50 text-[var(--yuriana-input-error)] border-red-200";
      default: 
        return "bg-slate-50 text-slate-400 border-slate-200";
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">Conductor</th>
            <th className="px-4 py-2.5">Contacto</th>
            <th className="px-4 py-2.5">Estado Laboral</th>
            <th className="px-4 py-2.5">Documentos</th>
            <th className="px-4 py-2.5 text-center">Estado Operativo</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-[var(--yuriana-input-placeholder)] italic text-sm">
                No se encontraron conductores con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_conductor} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-2.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--yuriana-base-gray-dark)]">{item.persona.nombre}</span>
                    <span className="text-[10px] text-[var(--yuriana-input-placeholder)] font-bold">CI: {item.persona.ci}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-gray-700">{item.persona.telefono}</span>
                    <span className="text-[var(--yuriana-input-placeholder)] font-medium">{item.persona.correo}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${
                    item.estado_laboral === EstadoLaboral.ACTIVO ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-red-50 text-[var(--yuriana-input-error)] border-red-100'
                  }`}>
                    {item.estado_laboral}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getDocBadge(item.estado)}`}>
                      {item.estado || 'sin verificar'}
                    </span>
                    {item.documento_critico && (
                      <span className="text-[9px] text-[var(--yuriana-input-error)] font-bold truncate max-w-[150px]">
                        {item.documento_critico}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                    item.estado_operativo === EstadoOperativo.DISPONIBLE ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-500'
                  }`}>
                    • {item.estado_operativo}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" onClick={() => onView(item)} className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform"><Eye size={18} /></button>
                    <button type="button" onClick={() => onEdit(item)} className="text-[var(--yuriana-input-placeholder)] hover:text-slate-600 hover:scale-110 transition-transform"><Pencil size={18} /></button>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.estado_operativo === EstadoOperativo.VIAJE || item.estado_operativo === EstadoOperativo.ASIGNADO) {
                          toast.error("No se puede eliminar", {
                            description: `El conductor "${item.persona.nombre}" está en estado ${item.estado_operativo === EstadoOperativo.VIAJE ? "En Viaje" : "Asignado"} y no puede eliminarse.`,
                          });
                          return;
                        }
                        onDelete(item.persona.ci);
                      }}
                      className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform"
                    >
                      <Trash2 size={18} />
                    </button>
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