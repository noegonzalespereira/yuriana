"use client";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { GastoGeneral, TipoGastoGeneral } from "@/types/gasto.types";

interface Props {
  data: GastoGeneral[];
  onView: (item: GastoGeneral) => void;
  onEdit: (item: GastoGeneral) => void;
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
  [TipoGastoGeneral.TALLER]:  "bg-amber-50 text-amber-600 border-amber-200",
  [TipoGastoGeneral.LLANTAS]: "bg-blue-50 text-blue-600 border-blue-200",
  [TipoGastoGeneral.OTROS]:   "bg-slate-50 text-slate-500 border-slate-200",
};

export const GastoGeneralTable = ({ data, onView, onEdit, onDelete }: Props) => {
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
                No se encontraron gastos generales.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_gasto_general} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-2.5 text-gray-600">
                  {fmtFecha(item.gasto?.fecha)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${TIPO_BADGE[item.tipo_gasto] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {item.tipo_gasto}
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
                    <button type="button" onClick={() => onDelete(item.id_gasto_general)} className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform">
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
