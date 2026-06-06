"use client";
import { useState, useEffect, useCallback } from "react";
import { XCircle, Truck, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { ServicioTable } from "@/components/organisms/ServicioTable";
import { ServicioForm } from "@/components/organisms/ServicioForm";
import {
  getServicios,
  getContadoresServicio,
  getServicioDetalle,
  eliminarServicio,
} from "@/lib/api/servicio.api";
import { getCategorias } from "@/lib/api/requisito.api";
import {
  ServicioItem,
  ContadoresServicio,
  FiltersServicio,
  EstadoPago,
  EstadoServicio,
  Operador,
} from "@/types/servicio.types";

type Vista = "list" | "form";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const SELECT_CLASS =
  "border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

const DeleteModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300 mx-4">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100/60 shadow-inner">
        <XCircle size={32} className="animate-pulse" />
      </div>
      <div className="space-y-2">
        <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">¿Eliminar este viaje?</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[320px] mx-auto">
          Este viaje será desactivado del sistema. Esta acción no puede deshacerse.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="w-full py-3.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm}
          className="w-full py-3.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md">
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

export default function ServiciosPage() {
  const [vista, setVista] = useState<Vista>("list");
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [contadores, setContadores] = useState<ContadoresServicio>({ en_curso: 0, pendientes: 0, retrasados: 0 });
  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [selected, setSelected] = useState<ServicioItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [categoriasViaje, setCategoriasViaje] = useState<{ id_categoria: number; tipo_categoria: string }[]>([]);

  const [filters, setFilters] = useState<FiltersServicio>({
    buscar: "", operador: "", estado_pago: "", estado_servicio: "",
    fecha_inicio: "", fecha_fin: "", id_categoria: undefined, facturado: "",
  });

  // ── Cargar datos ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [counts, list] = await Promise.all([
        getContadoresServicio(),
        getServicios(filters),
      ]);
      setContadores(counts);
      setServicios(list);
    } catch {
      toast.error("Error al cargar los viajes");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    getCategorias().then((cats) => {
      setCategoriasViaje(cats.filter(c => ['VIAJE_INTERNACIONAL', 'VIAJE_NACIONAL'].includes(c.tipo_categoria)));
    }).catch(() => {});
  }, []);

  // ── Totales por estado de pago (calculados en frontend) ───────────────────
  const totalPagados   = servicios.filter(s => s.estado_pago === EstadoPago.PAGADO).reduce((a, s) => a + Number(s.total_flete), 0);
  const totalPendientes = servicios.filter(s => s.estado_pago === EstadoPago.PENDIENTE).reduce((a, s) => a + Number(s.total_flete), 0);
  const totalRetrasados = servicios.filter(s => s.estado_pago === EstadoPago.RETRASADO).reduce((a, s) => a + Number(s.total_flete), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNuevo = () => { setSelected(null); setIsReadOnly(false); setVista("form"); };
  const handleFormSuccess = () => { setVista("list"); loadData(); };

  const handleVer = async (item: ServicioItem) => {
    try {
      const d = await getServicioDetalle(item.id_servicio);
      setSelected(d); setIsReadOnly(true); setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleEditar = async (item: ServicioItem) => {
    try {
      const d = await getServicioDetalle(item.id_servicio);
      setSelected(d); setIsReadOnly(false); setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await eliminarServicio(deleteId);
      toast.success("Viaje eliminado correctamente");
      loadData();
    } catch { toast.error("No se pudo eliminar el viaje"); }
    finally { setDeleteId(null); }
  };

  const setFilter = (key: keyof FiltersServicio, value: any) =>
    setFilters(f => ({ ...f, [key]: value }));

  const headerTitle = () => {
    if (vista === "list") return "Gestión de Viajes";
    if (isReadOnly) return "Detalle del Viaje";
    return selected ? "Editar Viaje" : "Registrar Nuevo Viaje";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={headerTitle()}
        subtitle={
          vista === "form"
            ? "Complete el formulario con los datos del viaje"
            : "Control y seguimiento de todos los servicios de transporte"
        }
        searchPlaceholder="Buscar por código, origen o destino..."
        onSearch={vista === "list" ? (val) => setFilter("buscar", val) : undefined}
        buttonLabel={vista === "list" ? "Nuevo Viaje" : undefined}
        onButtonClick={handleNuevo}
      />

      {/* ── Vista FORM ── */}
      {vista === "form" ? (
        <ServicioForm
          initialData={selected}
          isReadOnly={isReadOnly}
          onCancel={() => setVista("list")}
          onSuccess={handleFormSuccess}
        />
      ) : (
        /* ── Vista LIST ── */
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Viajes en Curso"   value={String(contadores.en_curso)}
              icon={<Truck size={22} />}
              borderColor="border-emerald-200" iconBg="bg-emerald-50" iconColor="text-emerald-500" />
            <StatCard label="Pagos Pendientes"  value={String(contadores.pendientes)}
              icon={<Clock size={22} />}
              borderColor="border-yellow-200" iconBg="bg-yellow-50" iconColor="text-yellow-500" />
            <StatCard label="Pagos Retrasados"  value={String(contadores.retrasados)}
              icon={<AlertTriangle size={22} />}
              borderColor="border-rose-200" iconBg="bg-rose-50" iconColor="text-rose-500" />
          </div>

          {/* Panel con filtros + tabla */}
          <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 space-y-4">

              {/* Fila 1: rango de fechas + botón nuevo */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                  <input type="date" value={filters.fecha_inicio ?? ""}
                    onChange={(e) => setFilter("fecha_inicio", e.target.value)}
                    className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                  <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                  <input type="date" value={filters.fecha_fin ?? ""}
                    onChange={(e) => setFilter("fecha_fin", e.target.value)}
                    className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                </div>
                
              </div>

              {/* Fila 2: filtros de select */}
              <div className="flex items-center gap-3 flex-wrap">
                <select className={SELECT_CLASS} value={filters.id_categoria ?? ""}
                  onChange={(e) => setFilter("id_categoria", e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Tipo de Viaje</option>
                  {categoriasViaje.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.tipo_categoria.includes("INTERNACIONAL") ? "Internacional" : "Nacional"}
                    </option>
                  ))}
                </select>
                <select className={SELECT_CLASS} value={filters.estado_pago ?? ""}
                  onChange={(e) => setFilter("estado_pago", e.target.value)}>
                  <option value="">Estado de Pago</option>
                  <option value={EstadoPago.PAGADO}>Pagado</option>
                  <option value={EstadoPago.PENDIENTE}>Pendiente</option>
                  <option value={EstadoPago.RETRASADO}>Retrasado</option>
                </select>
                <select className={SELECT_CLASS} value={filters.estado_servicio ?? ""}
                  onChange={(e) => setFilter("estado_servicio", e.target.value)}>
                  <option value="">Estado de Viaje</option>
                  <option value={EstadoServicio.EN_CURSO}>En Curso</option>
                  <option value={EstadoServicio.FINALIZADO}>Finalizado</option>
                </select>
                <select className={SELECT_CLASS} value={filters.operador ?? ""}
                  onChange={(e) => setFilter("operador", e.target.value)}>
                  <option value="">Operador</option>
                  <option value={Operador.YURIANA}>Yuriana</option>
                  <option value={Operador.OTROS}>Otros</option>
                </select>
                <select className={SELECT_CLASS} value={filters.facturado ?? ""}
                  onChange={(e) => setFilter("facturado", e.target.value as any)}>
                  <option value="">Facturado</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Tabla */}
              {loading ? (
                <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">
                  Cargando viajes...
                </div>
              ) : (
                <>
                  <ServicioTable
                    data={servicios}
                    onView={handleVer}
                    onEdit={handleEditar}
                    onDelete={(id) => setDeleteId(id)}
                  />
                  <p className="text-xs text-[var(--yuriana-input-placeholder)] font-medium">
                    Mostrando {servicios.length} viaje{servicios.length !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Totales por estado de pago */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Pagados",    value: totalPagados,    color: "text-emerald-600" },
              { label: "Total Pendientes", value: totalPendientes, color: "text-yellow-600" },
              { label: "Total Retrasados", value: totalRetrasados, color: "text-rose-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow p-6">
                <p className="text-[10px] text-[var(--yuriana-input-placeholder)] font-semibold uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-black mt-1 ${color}`}>
                  {fmt(value)} <span className="text-xs font-bold text-[var(--yuriana-input-placeholder)]">Bs</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteId !== null && (
        <DeleteModal onConfirm={handleConfirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}
