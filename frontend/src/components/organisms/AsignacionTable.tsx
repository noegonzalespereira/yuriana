"use client";
import { TableActions } from "@/components/atoms/TableActions";
import { Asignacion, EstadoAsignacion } from "@/types/asignacion.types";

interface Props {
  data: Asignacion[];
  onDelete: (id: number) => void;
  onEdit: (asignacion: Asignacion) => void;
  onView: (asignacion: Asignacion) => void;
}

export const AsignacionTable = ({ data, onDelete, onEdit, onView }: Props) => {
  if (data.length === 0) {
    return (
      <div className="py-20 text-center text-[var(--yuriana-base-gray-light)] italic text-xs border border-dashed border-border rounded-3xl bg-[var(--yuriana-base-white)]">
        No se registran enganches operacionales activos en este momento.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">Conductor</th>
            <th className="px-4 py-2.5">Tracto</th>
            <th className="px-4 py-2.5">Remolque / Semiremolque</th>
            <th className="px-4 py-2.5 text-center">Estado</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.map((item) => (
            <tr key={item.id_asignacion} className="hover:bg-slate-50/80 transition-colors">
              
              {/* CONDUCTOR */}
              <td className="px-4 py-2.5">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[var(--yuriana-base-black)] text-xs uppercase tracking-tight">
                    {item.conductor?.persona?.nombre || "Sin Identificar"}
                  </span>
                  <span className="text-[10px] text-[var(--yuriana-base-gray-light)] font-black uppercase mt-0.5 font-mono">
                    CI: {item.conductor?.persona?.ci || "S/CI"}
                  </span>
                </div>
              </td>

              {/* TRACTO */}
              <td className="px-4 py-2.5">
                <div className="flex flex-col text-left">
                  <span className="font-mono font-bold text-[var(--yuriana-base-gray-dark)] text-xs">
                    {item.tracto?.placa || "S/P"}
                  </span>
                  <span className="text-[10px] text-[var(--yuriana-base-gray-light)] font-black uppercase mt-0.5">
                    {item.tracto?.categoria?.tipo_categoria || "Tracto"}
                  </span>
                </div>
              </td>

              {/* REMOLQUE / SEMIREMOLQUE */}
              <td className="px-4 py-2.5">
                <div className="flex flex-col text-left">
                  <span className="font-mono font-bold text-[var(--yuriana-base-gray-dark)] text-xs">
                    {item.remolque?.placa || "S/P"}
                  </span>
                  <span className="text-[10px] text-[var(--yuriana-base-gray-light)] font-black uppercase mt-0.5">
                    {item.remolque?.categoria?.tipo_categoria || "Acoplado"}
                  </span>
                </div>
              </td>

              {/* ESTADO */}
              <td className="px-4 py-2.5 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.estado_asignacion === EstadoAsignacion.ACTIVA
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-blue-50 text-blue-700 border border-blue-100"
                }`}>
                  {item.estado_asignacion === EstadoAsignacion.ACTIVA ? "Activo" : "Asignado"}
                </span>
              </td>

              {/* ACCIONES COMPLETO */}
              <td className="px-4 py-2.5">
                <TableActions
                  onView={() => onView(item)}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id_asignacion)}
                  deleteDisabled={item.estado_asignacion !== EstadoAsignacion.ACTIVA}
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