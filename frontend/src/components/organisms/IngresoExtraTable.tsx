"use client";
import { TableActions } from "@/components/atoms/TableActions";
import { formatDateBolivia } from "@/lib/date-bolivia";
import { IngresoExtra } from "@/types/ingreso-extra.types";

interface Props {
  data: IngresoExtra[];
  onView: (item: IngresoExtra) => void;
  onEdit: (item: IngresoExtra) => void;
  onDelete: (id: number) => void;
}

const fmtFecha = (iso: string) => formatDateBolivia(iso);

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

export const IngresoExtraTable = ({ data, onView, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="w-12 px-3 py-2.5 text-center">#</th>
            <th className="px-4 py-2.5">Fecha</th>
            <th className="px-4 py-2.5">Descripción</th>
            <th className="px-4 py-2.5">Mes</th>
            <th className="px-4 py-2.5">Año</th>
            <th className="px-4 py-2.5 text-right">Monto Bs</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-[var(--yuriana-base-white)] font-medium text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-[var(--yuriana-input-placeholder)] italic text-xs">
                No se encontraron ingresos extras registrados.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id_ingreso_extra} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="w-12 px-3 py-2.5 text-center font-bold text-slate-400">{index + 1}</td>
                <td className="px-4 py-2.5 text-gray-600">{fmtFecha(item.fecha)}</td>
                <td className="px-4 py-2.5 text-gray-700 max-w-xs truncate">{item.descripcion}</td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase border bg-orange-50 text-[var(--yuriana-base-orange)] border-orange-200">
                    {item.mes}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-600 font-medium">{item.anio}</td>
                <td className="px-4 py-2.5 text-right font-bold text-[var(--yuriana-base-gray-dark)]">
                  {fmt(Number(item.monto))}
                </td>
                <td className="px-4 py-2.5">
                  <TableActions onView={() => onView(item)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id_ingreso_extra)} size={16} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
