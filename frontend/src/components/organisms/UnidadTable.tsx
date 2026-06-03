"use client";
import { Eye, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { Unidad, EstadoUnidad } from "@/types/unidad.types";

interface Props {
  data: Unidad[];
  onDelete: (placa: string) => void;
  onEdit: (unidad: Unidad) => void;
  onView: (unidad: Unidad) => void;
}

export const UnidadTable = ({ data, onDelete, onEdit, onView }: Props) => {
  
  // Renderizado dinámico de alertas de pólizas basado en tu backend polimórfico
  const getDocumentoBadgeStyles = (estado?: string) => {
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

  const getEstadoOperativoStyles = (estado: EstadoUnidad) => {
    switch (estado) {
      case EstadoUnidad.DISPONIBLE:
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case EstadoUnidad.EN_VIAJE:
        return "bg-blue-50 text-blue-600 border-blue-100";
      case EstadoUnidad.ASIGNADO:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case EstadoUnidad.MANTENIMIENTO:
        return "bg-amber-50 text-[var(--yuriana-base-yellow)] border-amber-100";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">N° Placa</th>
            <th className="px-4 py-2.5">Tipo de Unidad</th>
            <th className="px-4 py-2.5">Detalles Mecánicos</th>
            <th className="px-4 py-2.5">Estado Documental</th>
            <th className="px-4 py-2.5 text-center">Estado Operativo</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-[var(--yuriana-input-placeholder)] italic text-xs">
                No se localizaron unidades de transporte activos en el inventario logístico.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_unidad} className="hover:bg-slate-50/80 transition-colors text-xs">
                {/* PLACA */}
                <td className="px-4 py-2.5 font-black text-gray-900 tracking-tight uppercase">
                  {item.placa}
                </td>
                
                {/* CATEGORÍA */}
                <td className="px-4 py-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-slate-50 border-slate-200 text-slate-600">
                    {item.categoria?.tipo_categoria || "Sin tipo"}
                  </span>
                </td>

                {/* DETALLES MECÁNICOS */}
                <td className="px-4 py-2.5">
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-gray-800">Marca: {item.marca} </span>
                    <span className="text-[10px] text-[var(--yuriana-input-placeholder)] font-bold"> Año: {item.anio}</span>
                  </div>
                </td>

                {/* EXPEDIENTES / ALERTAS */}
                <td className="px-4 py-2.5">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getDocumentoBadgeStyles(item.estado)}`}>
                      {item.estado || 'sin verificar'}
                    </span>
                    {item.documento_critico && (
                      <span className="text-[9px] text-[var(--yuriana-input-error)] font-bold truncate max-w-[140px] flex items-center gap-0.5 mt-0.5">
                        <ShieldAlert size={10} /> {item.documento_critico}
                      </span>
                    )}
                  </div>
                </td>

                {/* ESTADO OPERATIVO */}
                <td className="px-4 py-2.5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${getEstadoOperativoStyles(item.estado_unidad)}`}>
                    • {item.estado_unidad}
                  </span>
                </td>

                {/* BOTONES ACCIONES */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" onClick={() => onView(item)} className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform">
                      <Eye size={18} />
                    </button>
                    <button type="button" onClick={() => onEdit(item)} className="text-[var(--yuriana-input-placeholder)] hover:text-slate-600 hover:scale-110 transition-transform">
                      <Pencil size={18} />
                    </button>
                    <button type="button" onClick={() => onDelete(item.placa)} className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform">
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