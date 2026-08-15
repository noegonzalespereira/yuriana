"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, Truck, UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import {
  getTotalesIngresos, getTotalesGastos, getTotalesPagos,
  getAlertasDashboard, getViajesRecientes, getAniosDisponibles,
  TotalesIngresos, TotalesGastos, TotalesPagos, DocumentoAlerta, ViajeReciente,
} from "@/lib/api/dashboard.api";

const MESES = [
  { label: "Enero", value: "01" }, { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },   { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" }, { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" }, { label: "Diciembre", value: "12" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const fmtFecha = (iso: string | null) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
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

export default function DashboardPage() {
  const now = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(
    (now.getMonth() + 1).toString().padStart(2, "0")
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(now.getFullYear());
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([now.getFullYear()]);

  const [ingresos, setIngresos] = useState<TotalesIngresos>({ totalFletes: 0, totalIngresoExtras: 0, totalIngresos: 0 });
  const [gastos, setGastos] = useState<TotalesGastos>({ totalGastosViaje: 0, totalGastosOperativos: 0, totalGastosAdministrativos: 0, totalGastosGenerales: 0, totalGastos: 0 });
  const [pagos, setPagos] = useState<TotalesPagos>({ total_por_cobrar: 0, total_cobrado: 0, total_retrasado: 0 });
  const [alertas, setAlertas] = useState<DocumentoAlerta[]>([]);
  const [viajes, setViajes] = useState<ViajeReciente[]>([]);

  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [loadingViajes, setLoadingViajes] = useState(true);

  // Años disponibles: carga una sola vez al montar
  useEffect(() => {
    getAniosDisponibles()
      .then((anios) => {
        if (anios.length > 0) {
          setAniosDisponibles(anios);
          if (!anios.includes(anioSeleccionado)) setAnioSeleccionado(anios[0]);
        }
      })
      .catch(() => {/* mantiene el año actual como fallback */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cards: recargan al cambiar mes o año
  useEffect(() => {
    setLoadingCards(true);

    Promise.all([
      getTotalesIngresos(mesSeleccionado, anioSeleccionado),
      getTotalesGastos(mesSeleccionado, anioSeleccionado),
      getTotalesPagos(mesSeleccionado, anioSeleccionado),
    ])
      .then(([ing, gst, pag]) => { setIngresos(ing); setGastos(gst); setPagos(pag); })
      .catch(() => toast.error("Error al cargar los totales"))
      .finally(() => setLoadingCards(false));
  }, [mesSeleccionado, anioSeleccionado]);

  // Alertas y viajes: cargan una sola vez
  useEffect(() => {
    getAlertasDashboard()
      .then(setAlertas)
      .catch(() => toast.error("Error al cargar alertas"))
      .finally(() => setLoadingAlertas(false));

    getViajesRecientes()
      .then(setViajes)
      .catch(() => toast.error("Error al cargar viajes recientes"))
      .finally(() => setLoadingViajes(false));
  }, []);

  // Estado de resultados calculado desde los datos ya cargados
  const utilidadNeta = ingresos.totalIngresos - gastos.totalGastos;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader title="Dashboard Principal" subtitle="Panel de control de transporte y logística" />

      {/* ── Cards de totales ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Ingresos Totales"
          value={loadingCards ? "..." : `${fmt(ingresos.totalIngresos)} Bs`}
          icon={<TrendingUp size={20} />}
          borderColor="border-[var(--yuriana-card-border)]"
          iconBg="bg-orange-50" iconColor="text-[var(--yuriana-base-orange)]"
        />
        <StatCard
          label="Gastos Totales"
          value={loadingCards ? "..." : `${fmt(gastos.totalGastos)} Bs`}
          icon={<TrendingDown size={20} />}
          borderColor="border-rose-200" iconBg="bg-rose-50" iconColor="text-rose-500"
        />
        <StatCard
          label="Total Cobrado"
          value={loadingCards ? "..." : `${fmt(pagos.total_cobrado)} Bs`}
          icon={<CheckCircle2 size={20} />}
          borderColor="border-emerald-200" iconBg="bg-emerald-50" iconColor="text-emerald-500"
        />
        <StatCard
          label="Por Cobrar"
          value={loadingCards ? "..." : `${fmt(pagos.total_por_cobrar)} Bs`}
          icon={<Clock size={20} />}
          borderColor="border-amber-200" iconBg="bg-amber-50" iconColor="text-amber-500"
        />
        <StatCard
          label="Pagos Retrasados"
          value={loadingCards ? "..." : `${fmt(pagos.total_retrasado)} Bs`}
          icon={<AlertTriangle size={20} />}
          borderColor="border-rose-300" iconBg="bg-rose-50" iconColor="text-rose-600"
        />
      </div>

      {/* ── Estado de resultados + Alertas documentales ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de Resultados */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
            <h2 className="font-black text-sm uppercase tracking-tight text-[var(--yuriana-base-gray-dark)]">
              Estado de Resultados
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                className="text-xs font-bold bg-[var(--yuriana-base-orange)] text-white rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                {aniosDisponibles.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="text-xs font-bold bg-[var(--yuriana-base-orange)] text-white rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          {loadingCards ? (
            <div className="py-16 text-center text-xs text-slate-400 italic">Cargando...</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-6 py-2.5 text-left font-black uppercase text-[var(--yuriana-base-gray-dark)] tracking-wider text-[10px]">Concepto</th>
                  <th className="px-6 py-2.5 text-right font-black uppercase text-[var(--yuriana-base-gray-dark)] tracking-wider text-[10px]">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { label: "Ingresos Fletes",              value: ingresos.totalFletes,                  highlight: false },
                  { label: "Ingresos Extras",               value: ingresos.totalIngresoExtras,           highlight: false },
                  { label: "Total Gastos del Servicio",     value: gastos.totalGastosViaje,               highlight: false },
                  { label: "Total Gastos Operativos",       value: gastos.totalGastosOperativos,          highlight: false },
                  { label: "Total Gastos Administrativos",  value: gastos.totalGastosAdministrativos,     highlight: false },
                  { label: "Total Gastos Generales",        value: gastos.totalGastosGenerales,           highlight: false },
                  { label: "Utilidad Neta",                 value: utilidadNeta,                          highlight: true  },
                ].map((row) => (
                  <tr key={row.label} className={row.highlight ? "bg-orange-50 font-black" : "hover:bg-slate-50/40 transition-colors"}>
                    <td className={`px-6 py-3 text-xs ${row.highlight ? "text-[var(--yuriana-base-orange)] uppercase tracking-wide font-black" : "text-[var(--yuriana-base-gray-dark)] font-medium"}`}>
                      {row.label}
                    </td>
                    <td className={`px-6 py-3 text-right text-xs font-bold ${row.highlight ? (row.value >= 0 ? "text-emerald-600" : "text-rose-500") : "text-[var(--yuriana-base-gray-dark)]"}`}>
                      {fmt(row.value)} Bs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alertas Documentales */}
        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <h2 className="font-black text-sm uppercase tracking-tight text-[var(--yuriana-base-gray-dark)]">Alertas Documentales</h2>
            {alertas.length > 0 && (
              <span className="bg-[var(--yuriana-alert-vencido-border)] text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {alertas.length} alerta{alertas.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {loadingAlertas ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">Cargando alertas...</div>
          ) : alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 px-4">
              <span className="text-xs font-bold text-[var(--yuriana-base-gray-dark)] text-center">Todos los documentos están vigentes</span>
            </div>
          ) : (
            <div className="px-4 pb-5 pt-3 space-y-5 overflow-y-auto max-h-[420px] custom-scrollbar">
              {(["CONDUCTOR", "UNIDAD"] as const).map((tipo) => {
                const items = alertas.filter((d) => d.tipo === tipo);
                if (items.length === 0) return null;
                return (
                  <div key={tipo} className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100">
                        {tipo === "UNIDAD" ? <Truck size={13} className="text-[var(--yuriana-base-gray-dark)]" /> : <UserCircle size={13} className="text-[var(--yuriana-base-gray-dark)]" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-base-gray-dark)]">
                        {tipo === "UNIDAD" ? "Unidades" : "Conductores"}
                      </span>
                      <span className="ml-auto text-[9px] font-black bg-slate-100 text-[var(--yuriana-base-gray-dark)] px-2 py-0.5 rounded-full">{items.length}</span>
                    </div>
                    {items.map((doc) => {
                      const esVencido = doc.urgencia === "VENCIDO";
                      const esHoy = doc.urgencia === "HOY";
                      return (
                        <div key={doc.id_documento}
                          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 border-l-4"
                          style={{ background: esVencido ? "var(--yuriana-alert-vencido-bg)" : "var(--yuriana-alert-porvencer-bg)", borderLeftColor: esVencido ? "var(--yuriana-alert-vencido-border)" : "var(--yuriana-alert-porvencer-border)", borderTopColor: "transparent", borderRightColor: "transparent", borderBottomColor: "transparent" }}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-[var(--yuriana-base-gray-dark)] truncate leading-tight">{doc.nombre}</span>
                            <span className="text-[10px] font-semibold text-[var(--yuriana-base-gray-dark)] opacity-70 truncate">{doc.tipo_documento}</span>
                          </div>
                          <span className="shrink-0 flex flex-col items-center text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide text-white text-center"
                            style={{ background: esVencido ? "var(--yuriana-alert-vencido-border)" : "var(--yuriana-alert-porvencer-border)" }}>
                            {esVencido ? "Vencido" : esHoy ? "Hoy" : <><span>Por vencer</span><span>{doc.dias_restantes} días</span></>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Viajes Recientes ── */}
      <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 className="font-black text-sm uppercase tracking-tight text-[var(--yuriana-base-gray-dark)]">Viajes Recientes (Solo se muestre 10 viajes recientes)</h2>
        </div>
        {loadingViajes ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">Cargando...</div>
        ) : viajes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">No hay viajes registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-4 py-2.5 text-center">#</th>
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
              <tbody className="divide-y divide-border text-xs font-medium text-[var(--yuriana-base-gray-dark)]">
                {viajes.map((v, index) => {
                  const esInternacional = v.tipo_categoria?.toUpperCase().includes("INTERNACIONAL");
                  return (
                    <tr key={v.id_servicio} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-[var(--yuriana-base-orange)]">{v.codigo_servicio}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{v.cliente_nombre || "-"}</div>
                        <div className="text-[10px] opacity-60">{v.conductor_nombre || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{v.tracto_placa || "-"}</div>
                        <div className="text-[10px] opacity-60">{v.remolque_placa || ""}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{v.origen} → {v.destino}</div>
                        <span className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-md border ${esInternacional ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                          {esInternacional ? "INTERNACIONAL" : "NACIONAL"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{fmt(Number(v.total_flete))} Bs</td>
                      <td className="px-4 py-3 text-[10px] opacity-80">
                        <div>Inicio: {fmtFecha(v.fecha_inicio)}</div>
                        <div>Fin: {fmtFecha(v.fecha_fin)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${ESTADO_PAGO_STYLE[v.estado_pago]}`}>{v.estado_pago}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${ESTADO_SERVICIO_STYLE[v.estado_servicio]}`}>
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
