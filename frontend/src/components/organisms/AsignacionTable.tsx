// src/components/organisms/AsignacionTable.tsx
"use client";
import { TableActions } from "@/components/atoms/TableActions";
import { Asignacion, EstadoAsignacion } from "@/types/asignacion.types";
import { Empresa } from "@/types/empresa.types"; // Importamos el tipo empresa
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReporteAsignacion } from "./reportes/ReporteAsignacion";
import { FileText, Globe, Loader2 } from "lucide-react";

interface Props {
  data: Asignacion[];
  infoEmpresa: Empresa | null; // ◄ REGISTRADO: Datos de la empresa inyectados desde el Page
  onDelete: (id: number) => void;
  onEdit: (asignacion: Asignacion) => void;
  onView: (asignacion: Asignacion) => void;
}

export const AsignacionTable = ({ data, infoEmpresa, onDelete, onEdit, onView }: Props) => {
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
            <th className="w-12 px-4 py-2.5 text-center">#</th>

            <th className="px-4 py-2.5">Conductor</th>
            <th className="px-4 py-2.5">Tracto</th>
            <th className="px-4 py-2.5">Remolque / Semiremolque</th>
            <th className="px-4 py-2.5 text-center">Estado</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium">
          {data.map((item, index) => (
            <tr key={item.id_asignacion} className="hover:bg-slate-50/80 transition-colors">
              <td className="w-12 px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>

              {/* CONDUCTOR */}
              <td className="px-4 py-2.5">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-xs uppercase tracking-tight">
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
                  <span className="font-mono font-bold text-xs">
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
                  <span className="font-mono font-bold text-xs">
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
                  {item.estado_asignacion === EstadoAsignacion.ACTIVA ? "Activa" : "Asignado"}
                </span>
              </td>

              {/* ACCIONES */}
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-center gap-2">
                  
                  {/* 🇨🇴 REPORTE CONTROL NACIONAL */}
                  <PDFDownloadLink
                    document={<ReporteAsignacion data={item} tipoFormato="nacional" infoEmpresa={infoEmpresa} />}
                    fileName={`NACIONAL_${item.tracto?.placa || "UNIDAD"}.pdf`}
                    className="p-1.5 text-[var(--yuriana-base-orange)] hover:bg-orange-50 rounded-lg transition-all"
                    title="Exportar Control Nacional"
                  >
                    {({ loading }: { loading: boolean }) => 
                      loading ? (
                        <Loader2 size={16} className="animate-spin text-gray-300" />
                      ) : (
                        <FileText size={16} />
                      )
                    }
                  </PDFDownloadLink>

                  {/* 🌎 REPORTE MANIFIESTO INTERNACIONAL */}
                  <PDFDownloadLink
                    document={<ReporteAsignacion data={item} tipoFormato="internacional" infoEmpresa={infoEmpresa} />}
                    fileName={`INTERNACIONAL_${item.tracto?.placa || "UNIDAD"}.pdf`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Exportar Manifiesto Internacional"
                  >
                    {({ loading }: { loading: boolean }) => 
                      loading ? (
                        <Loader2 size={16} className="animate-spin text-gray-300" />
                      ) : (
                        <Globe size={16} />
                      )
                    }
                  </PDFDownloadLink>

                  <TableActions
                    onView={() => onView(item)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id_asignacion)}
                    deleteDisabled={item.estado_asignacion !== EstadoAsignacion.ACTIVA}
                    size={18}
                  />

                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};