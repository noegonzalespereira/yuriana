"use client";
import { TableActions } from "@/components/atoms/TableActions";
import { GastosServicio } from "@/types/gasto.types";

interface Props {
  data: GastosServicio[];
  onView: (item: GastosServicio) => void;
  onEdit: (item: GastosServicio) => void;
  onDelete: (id: number) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const fmtFecha = (iso: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const GastoServicioTable = ({ data, onView, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">ID Viaje</th>
            <th className="px-4 py-2.5">Fecha</th>
            <th className="px-4 py-2.5">Moneda</th>
            <th className="px-4 py-2.5 text-right">Viático Bs</th>
            <th className="px-4 py-2.5 text-right">Monto Total Bs</th>
            <th className="px-4 py-2.5 text-right">Saldo Bs</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-[var(--yuriana-input-placeholder)] italic text-xs">
                No se encontraron registros de costos del servicio.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_gasto_servicio} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-2.5">
                  <span className="font-black text-[var(--yuriana-base-orange)]">
                    {item.servicio?.codigo_servicio ?? `#${item.id_servicio}`}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {fmtFecha(item.fecha_registro)}
                </td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    {item.moneda}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-gray-700">
                  {fmt(item.viatico_bs)}
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-[var(--yuriana-base-gray-dark)]">
                  {fmt(item.total_gastos_bs)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`font-black ${item.saldo_bs >= 0 ? "text-emerald-600" : "text-[var(--yuriana-input-error)]"}`}>
                    {fmt(item.saldo_bs)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <TableActions onView={() => onView(item)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id_gasto_servicio)} size={18} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
