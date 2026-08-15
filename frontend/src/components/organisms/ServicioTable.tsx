"use client";
import { TableActions } from "@/components/atoms/TableActions";
import { ServicioItem, EstadoPago, EstadoServicio } from "@/types/servicio.types";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const PAGO_BADGE: Record<EstadoPago, string> = {
  [EstadoPago.PAGADO]:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  [EstadoPago.PENDIENTE]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [EstadoPago.RETRASADO]: "bg-rose-100 text-rose-700 border-rose-200",
};

const ESTADO_BADGE: Record<EstadoServicio, string> = {
  [EstadoServicio.EN_CURSO]:   "bg-blue-100 text-blue-700 border-blue-200",
  [EstadoServicio.FINALIZADO]: "bg-slate-100 text-slate-600 border-slate-200",
};

interface Props {
  data: ServicioItem[];
  onView: (item: ServicioItem) => void;
  onEdit: (item: ServicioItem) => void;
  onDelete: (id: number) => void;
}

export const ServicioTable = ({ data, onView, onEdit, onDelete }: Props) => {
  const esInternacional = (item: ServicioItem) =>
    item.categoria?.tipo_categoria?.toUpperCase().includes("INTERNACIONAL");

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--yuriana-input-border)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[9px] font-black tracking-widest">
          <tr>
            <th className="px-4 py-2.5">ID Viaje</th>
            <th className="px-4 py-2.5">Empresa / Conductor</th>
            <th className="px-4 py-2.5">Vehículo</th>
            <th className="px-4 py-2.5">Ruta / Tipo</th>
            <th className="px-4 py-2.5 text-right">Flete Total</th>
            <th className="px-4 py-2.5">Fechas</th>
            <th className="px-4 py-2.5 text-center">Fecha Pago</th>
            <th className="px-4 py-2.5 text-center">Pago</th>
            <th className="px-4 py-2.5 text-center">Estado</th>
            <th className="px-4 py-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--yuriana-input-border)] text-xs">
          {data.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-16 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">
                No hay viajes registrados con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id_servicio} className="hover:bg-orange-50/30 transition-colors">
              {/* ID Viaje */}
              <td className="px-4 py-2.5">
                <span className="font-black text-[var(--yuriana-base-orange)]">
                  {item.codigo_servicio}
                </span>
              </td>

              {/* Empresa / Conductor */}
              <td className="px-4 py-2.5">
                <p className="font-black text-[var(--yuriana-base-gray-dark)] text-[11px]">
                  {item.cliente?.persona?.nombre ?? "-"}
                </p>
                <p className="text-[var(--yuriana-input-placeholder)] text-[10px]">
                  {item.asignacion?.conductor?.persona?.nombre ?? "-"}
                </p>
              </td>

              {/* Vehículo */}
              <td className="px-4 py-2.5">
                <p className="font-bold text-[var(--yuriana-base-gray-dark)]">
                  {item.asignacion?.tracto?.placa ?? "-"}
                </p>
                {item.asignacion?.remolque?.placa && (
                  <p className="text-[var(--yuriana-input-placeholder)] text-[10px]">
                    {item.asignacion.remolque.placa}
                  </p>
                )}
              </td>

              {/* Ruta / Tipo */}
              <td className="px-4 py-2.5 max-w-[160px]">
                <p className="text-[var(--yuriana-base-gray-dark)] font-medium truncate">
                  {item.origen} → {item.destino}
                </p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                  esInternacional(item)
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }`}>
                  {esInternacional(item) ? "Internacional" : "Nacional"}
                </span>
              </td>

              {/* Flete Total */}
              <td className="px-4 py-2.5 text-right font-black text-[var(--yuriana-base-gray-dark)]">
                {fmt(Number(item.total_flete))} Bs
              </td>

              {/* Fechas */}
              <td className="px-4 py-2.5">
                <p className="text-[10px] text-[var(--yuriana-input-placeholder)]">
                  Inicio: <span className="text-[var(--yuriana-base-gray-dark)] font-medium">{item.fecha_inicio?.slice(0, 10)}</span>
                </p>
                {item.fecha_fin && (
                  <p className="text-[10px] text-[var(--yuriana-input-placeholder)]">
                    Fin: <span className="text-[var(--yuriana-base-gray-dark)] font-medium">{item.fecha_fin?.slice(0, 10)}</span>
                  </p>
                )}
              </td>

              {/* Fecha Pago */}
              <td className="px-4 py-2.5 text-center">
                {(item as any).fecha_pago ? (
                  <span className="font-bold text-emerald-600">
                    {new Date((item as any).fecha_pago).toLocaleDateString('es-BO', { timeZone: 'UTC' })}
                  </span>
                ) : <span className="text-slate-400">-</span>}
              </td>

              {/* Pago */}
              <td className="px-4 py-2.5 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${PAGO_BADGE[item.estado_pago] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {item.estado_pago}
                </span>
              </td>

              {/* Estado */}
              <td className="px-4 py-2.5 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${ESTADO_BADGE[item.estado_servicio] ?? "bg-slate-100 text-slate-600"}`}>
                  ● {item.estado_servicio}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-4 py-2.5">
                <TableActions onView={() => onView(item)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id_servicio)} size={14} />
              </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
