"use client";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { GastoAdministrativo, TipoGastoAdministrativo } from "@/types/gasto.types";

interface Props {
  data: GastoAdministrativo[];
  onView: (item: GastoAdministrativo) => void;
  onEdit: (item: GastoAdministrativo) => void;
  onDelete: (id: number) => void;
}

const fmtFecha = (iso: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const TIPO_BADGE: Record<string, string> = {
  [TipoGastoAdministrativo.CONTADOR]: "bg-purple-50 text-purple-600 border-purple-200",
  [TipoGastoAdministrativo.IMPUESTO]: "bg-red-50 text-red-500 border-red-200",
  [TipoGastoAdministrativo.GPS]: "bg-blue-50 text-blue-600 border-blue-200",
  [TipoGastoAdministrativo.SUELDO_CONDUCTORES]: "bg-emerald-50 text-emerald-600 border-emerald-200",
  [TipoGastoAdministrativo.OTROS]: "bg-slate-50 text-slate-500 border-slate-200",
};

export const GastoAdministrativoTable = ({ data, onView, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">Fecha</th>
            <th className="px-4 py-2.5">Tipo de Gasto</th>
            <th className="px-4 py-2.5">Descripción</th>
            <th className="px-4 py-2.5 text-right">Monto Bs</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-[var(--yuriana-input-placeholder)] italic text-xs">
                No se encontraron gastos administrativos.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_gasto_admin} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-2.5 text-gray-600">
                  {fmtFecha(item.gasto?.fecha)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${TIPO_BADGE[item.tipo_gasto] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {item.tipo_gasto.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-700">
                  {item.gasto?.descripcion ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-[var(--yuriana-base-gray-dark)]">
                  {fmt(item.gasto?.monto ?? 0)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" onClick={() => onView(item)} className="text-[var(--yuriana-base-orange)] hover:scale-110 transition-transform">
                      <Eye size={16} />
                    </button>
                    <button type="button" onClick={() => onEdit(item)} className="text-[var(--yuriana-input-placeholder)] hover:text-slate-600 hover:scale-110 transition-transform">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => onDelete(item.id_gasto_admin)} className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform">
                      <Trash2 size={16} />
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
