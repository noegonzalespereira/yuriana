"use client";
import { TableActions } from "@/components/atoms/TableActions";
import { formatDateBolivia } from "@/lib/date-bolivia";
import { GastoOperativo, TipoGastoOperativo } from "@/types/gasto.types";

interface Props {
  data: GastoOperativo[];
  onView: (item: GastoOperativo) => void;
  onEdit: (item: GastoOperativo) => void;
  onDelete: (id: number) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const fmtFecha = (iso: string) => formatDateBolivia(iso);

const TIPO_BADGE: Record<string, string> = {
  [TipoGastoOperativo.MANTENIMIENTO]: "bg-amber-50 text-amber-600 border-amber-200",
  [TipoGastoOperativo.COMBUSTIBLE]: "bg-blue-50 text-blue-600 border-blue-200",
  [TipoGastoOperativo.REPUESTOS]: "bg-slate-50 text-slate-600 border-slate-200",
};

export const GastoOperativoTable = ({ data, onView, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="w-12 px-3 py-2.5 text-center">#</th>
            <th className="px-4 py-2.5">Placa</th>
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
              <td colSpan={7} className="text-center py-12 text-[var(--yuriana-input-placeholder)] italic text-xs">
                No se encontraron gastos operativos.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id_gasto_operativo} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="w-12 px-3 py-2.5 text-center font-bold text-slate-400">{index + 1}</td>
                <td className="px-4 py-2.5">
                  <span className="font-black text-[var(--yuriana-base-orange)] uppercase tracking-tight">
                    {item.unidad?.placa ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {fmtFecha(item.gasto?.fecha)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${TIPO_BADGE[item.tipo_gasto] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
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
                  <TableActions onView={() => onView(item)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id_gasto_operativo)} size={16} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
