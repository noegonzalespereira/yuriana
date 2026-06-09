"use client";
import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import {
  getDashboardResumen,
  getEstadoResultados,
  getDocumentosVencidos,
  getUltimosViajes,
} from "@/lib/api/cierre-mensual.api";
import {
  DashboardResumen,
  EstadoResultados,
  DocumentoVencido,
  UltimoViaje,
} from "@/types/cierre-mensual.types";

const MESES = [
  { label: "Enero", value: "01" },
  { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },
  { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const fmtFecha = (iso: string | null) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ESTADO_PAGO_STYLE: Record<string, string> = {
  PAGADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
  RETRASADO: "bg-rose-100 text-rose-700 border-rose-200",
};

const ESTADO_SERVICIO_STYLE: Record<string, string> = {
  EN_CURSO: "bg-blue-100 text-blue-700 border-blue-200",
  FINALIZADO: "bg-slate-100 text-slate-600 border-slate-200",
};

const URGENCIA_STYLE: Record<string, string> = {
  VENCIDO: "bg-rose-500 text-white",
  HOY: "bg-amber-500 text-white",
  PROXIMO: "bg-orange-400 text-white",
};

export default function DashboardPage() {
  const now = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(
    (now.getMonth() + 1).toString().padStart(2, "0")
  );
  const [anioSeleccionado] = useState(now.getFullYear());

  const [resumen, setResumen] = useState<DashboardResumen>({
    total_ingresos: 0,
    total_gastos: 0,
    total_pagos_por_cobrar: 0,
    total_pagos_cobrados: 0,
  });
  const [estadoResultados, setEstadoResultados] =
    useState<EstadoResultados | null>(null);
  const [docsVencidos, setDocsVencidos] = useState<DocumentoVencido[]>([]);
  const [ultimosViajes, setUltimosViajes] = useState<UltimoViaje[]>([]);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [loadingEstado, setLoadingEstado] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingViajes, setLoadingViajes] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardResumen(),
      getDocumentosVencidos(),
      getUltimosViajes(),
    ])
      .then(([res, docs, viajes]) => {
        setResumen(res);
        setDocsVencidos(docs);
        setUltimosViajes(viajes);
      })
      .catch(() => toast.error("Error al cargar el dashboard"))
      .finally(() => {
        setLoadingResumen(false);
        setLoadingDocs(false);
        setLoadingViajes(false);
      });
  }, []);

  const cargarEstadoResultados = useCallback(async () => {
    setLoadingEstado(true);
    try {
      const data = await getEstadoResultados(mesSeleccionado, anioSeleccionado);
      setEstadoResultados(data);
    } catch {
      toast.error("Error al cargar el estado de resultados");
    } finally {
      setLoadingEstado(false);
    }
  }, [mesSeleccionado, anioSeleccionado]);

  useEffect(() => {
    cargarEstadoResultados();
  }, [cargarEstadoResultados]);

  const mesLabel =
    MESES.find((m) => m.value === mesSeleccionado)?.label ?? mesSeleccionado;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title="Dashboard Principal"
        subtitle="Panel de control de transporte y logística"
      />

      {/* ── Tarjetas de resumen ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ingresos Totales"
          value={loadingResumen ? "..." : `${fmt(resumen.total_ingresos)} Bs`}
          icon={<TrendingUp size={20} />}
          borderColor="border-[var(--yuriana-card-border)]"
          iconBg="bg-orange-50"
          iconColor="text-[var(--yuriana-base-orange)]"
        />
        <StatCard
          label="Gastos Totales"
          value={loadingResumen ? "..." : `${fmt(resumen.total_gastos)} Bs`}
          icon={<TrendingDown size={20} />}
          borderColor="border-rose-200"
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />
        <StatCard
          label="Total Pagos por Cobrar"
          value={
            loadingResumen
              ? "..."
              : `${fmt(resumen.total_pagos_por_cobrar)} Bs`
          }
          icon={<Clock size={20} />}
          borderColor="border-amber-200"
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatCard
          label="Total Pagos Cobrados"
          value={
            loadingResumen ? "..." : `${fmt(resumen.total_pagos_cobrados)} Bs`
          }
          icon={<CheckCircle2 size={20} />}
          borderColor="border-emerald-200"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />
      </div>

      {/* ── Estado de resultados + Documentos vencidos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de Resultados */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="font-black text-sm uppercase tracking-tight text-slate-800">
              Estado de Resultados
            </h2>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="text-xs font-bold bg-[var(--yuriana-base-orange)] text-white rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {loadingEstado ? (
            <div className="py-16 text-center text-xs text-slate-400 italic">
              Cargando...
            </div>
          ) : estadoResultados ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-6 py-2.5 text-left font-black uppercase text-slate-500 tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-2.5 text-right font-black uppercase text-slate-500 tracking-wider">
                    Monto Acumulado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  {
                    label: "Ingresos Fletes",
                    value: estadoResultados.ingresos_fletes,
                    highlight: false,
                  },
                  {
                    label: "Ingresos Extras",
                    value: estadoResultados.ingresos_extras,
                    highlight: false,
                  },
                  {
                    label: "Total Gastos del Servicio",
                    value: estadoResultados.total_gastos_servicio,
                    highlight: false,
                  },
                  {
                    label: "Total Gastos Operativos",
                    value: estadoResultados.total_gastos_operativos,
                    highlight: false,
                  },
                  {
                    label: "Total Gastos Administrativos",
                    value: estadoResultados.total_gastos_admin,
                    highlight: false,
                  },
                  {
                    label: "Total Gastos Generales",
                    value: estadoResultados.total_gastos_generales,
                    highlight: false,
                  },
                  {
                    label: "Utilidad Neta",
                    value: estadoResultados.utilidad_neta,
                    highlight: true,
                  },
                ].map((row) => (
                  <tr
                    key={row.label}
                    className={
                      row.highlight
                        ? "bg-orange-50 font-black"
                        : "hover:bg-slate-50/60 transition-colors"
                    }
                  >
                    <td
                      className={`px-6 py-3 ${row.highlight ? "text-[var(--yuriana-base-orange)] uppercase tracking-wide" : "text-slate-700"}`}
                    >
                      {row.label}
                    </td>
                    <td
                      className={`px-6 py-3 text-right font-bold ${
                        row.highlight
                          ? row.value >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                          : "text-slate-700"
                      }`}
                    >
                      {fmt(row.value)} Bs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400 italic">
              No hay datos para {mesLabel} {anioSeleccionado}
            </div>
          )}
        </div>

        {/* Documentos Vencidos */}
        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-black text-sm uppercase tracking-tight text-slate-800">
              Documentos Vencidos
            </h2>
            {docsVencidos.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                URGENTE
              </span>
            )}
          </div>

          {loadingDocs ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              Cargando...
            </div>
          ) : docsVencidos.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic px-4">
              Sin documentos vencidos o próximos a vencer.
            </div>
          ) : (
            <div className="px-4 pb-5 space-y-2">
              {/* Agrupa por tipo */}
              {(["UNIDAD", "CONDUCTOR"] as const).map((tipo) => {
                const items = docsVencidos.filter((d) => d.tipo === tipo);
                if (items.length === 0) return null;
                return (
                  <div key={tipo}>
                    <div className="flex items-center gap-1.5 py-2 border-b border-slate-100 mb-2">
                      {tipo === "UNIDAD" ? (
                        <Truck size={13} className="text-slate-500" />
                      ) : (
                        <UserCircle size={13} className="text-slate-500" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {tipo === "UNIDAD" ? "Unidades" : "Conductores"}
                      </span>
                    </div>
                    {items.map((doc) => (
                      <div
                        key={doc.id_documento}
                        className="flex items-center justify-between py-2.5 px-1 border-b border-slate-50 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">
                            {doc.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {doc.tipo_documento}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${URGENCIA_STYLE[doc.urgencia]}`}
                        >
                          {doc.urgencia === "VENCIDO"
                            ? "Vencido"
                            : doc.urgencia === "HOY"
                              ? "Expira Hoy"
                              : `${doc.dias_restantes}d`}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Últimos viajes ── */}
      <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h2 className="font-black text-sm uppercase tracking-tight text-slate-800">
            Viajes Recientes
          </h2>
        </div>

        {loadingViajes ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            Cargando...
          </div>
        ) : ultimosViajes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No hay viajes registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-4 py-2.5">ID Viaje</th>
                  <th className="px-4 py-2.5">Empresa / Conductor</th>
                  <th className="px-4 py-2.5">Vehículo</th>
                  <th className="px-4 py-2.5">Ruta / Tipo</th>
                  <th className="px-4 py-2.5 text-right">Flete Total</th>
                  <th className="px-4 py-2.5">Fechas (Inicio/Fin)</th>
                  <th className="px-4 py-2.5">Pago</th>
                  <th className="px-4 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium text-slate-700">
                {ultimosViajes.map((v) => {
                  const esInternacional = v.tipo_categoria
                    ?.toUpperCase()
                    .includes("INTERNACIONAL");
                  return (
                    <tr
                      key={v.id_servicio}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-[var(--yuriana-base-orange)]">
                        {v.codigo_servicio}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-700">
                          {v.cliente_nombre || "-"}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {v.conductor_nombre || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{v.tracto_placa || "-"}</div>
                        <div className="text-slate-400 text-[10px]">
                          {v.remolque_placa || ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          {v.origen} → {v.destino}
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            esInternacional
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          }`}
                        >
                          {esInternacional ? "INTERNACIONAL" : "NACIONAL"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {fmt(Number(v.total_flete))} Bs
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-500">
                        <div>Inicio: {fmtFecha(v.fecha_inicio)}</div>
                        <div>Fin: {fmtFecha(v.fecha_fin)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${ESTADO_PAGO_STYLE[v.estado_pago]}`}
                        >
                          {v.estado_pago}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${ESTADO_SERVICIO_STYLE[v.estado_servicio]}`}
                        >
                          • {v.estado_servicio === "EN_CURSO" ? "EN CURSO" : "FINALIZADO"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
