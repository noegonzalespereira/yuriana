"use client";
import { useState, useEffect, useCallback } from "react";
import { XCircle, TrendingUp, Truck } from "lucide-react";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { TablePagination } from "@/components/molecules/TablePagination";
import { toast } from "sonner";

const PAGE_SIZE = 10;
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { IngresoExtraTable } from "@/components/organisms/IngresoExtraTable";
import { IngresoExtraForm } from "@/components/organisms/IngresoExtraForm";
import {
  getIngresos,
  getTotalesIngreso,
  getDetalleIngreso,
  eliminarIngreso,
} from "@/lib/api/ingreso-extra.api";
import { IngresoExtra, TotalesIngreso, IngresoFilters } from "@/types/ingreso-extra.types";

type Vista = "list" | "form";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const hoy = new Date();
const primerDiaMes = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/La_Paz",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date(hoy.getFullYear(), hoy.getMonth(), 1)).replace('/', '-').replace('/', '-');
const ultimoDiaMes = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/La_Paz",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)).replace('/', '-').replace('/', '-');

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
        <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">¿Eliminar este registro?</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[320px] mx-auto">
          Este ingreso extra será desactivado del sistema. Esta acción no puede deshacerse.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

export default function IngresosPage() {
  const [vista, setVista] = useState<Vista>("list");
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [totales, setTotales] = useState<TotalesIngreso>({ totalIngresoExtras: 0, totalFletes: 0 });
  const [ingresos, setIngresos] = useState<IngresoExtra[]>([]);
  const [selected, setSelected] = useState<IngresoExtra | null>(null);
  const INITIAL_FILTERS: IngresoFilters = {
    fecha_inicio: primerDiaMes,
    fecha_fin: ultimoDiaMes,
    buscar: "",
  };
  const [filters, setFilters] = useState<IngresoFilters>(INITIAL_FILTERS);
  const handleResetFilters = () => setFilters(INITIAL_FILTERS);
  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [filters]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tots, list] = await Promise.all([
        getTotalesIngreso({ fecha_inicio: filters.fecha_inicio, fecha_fin: filters.fecha_fin }),
        getIngresos(filters),
      ]);
      setTotales(tots);
      setIngresos(list);
    } catch {
      toast.error("Error al cargar los ingresos extras");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNuevo = () => {
    setSelected(null);
    setIsReadOnly(false);
    setVista("form");
  };

  const handleFormSuccess = () => {
    setVista("list");
    loadData();
  };

  const handleVer = async (item: IngresoExtra) => {
    try {
      const d = await getDetalleIngreso(item.id_ingreso_extra);
      setSelected(d);
      setIsReadOnly(true);
      setVista("form");
    } catch {
      toast.error("No se pudo cargar el detalle");
    }
  };

  const handleEditar = async (item: IngresoExtra) => {
    try {
      const d = await getDetalleIngreso(item.id_ingreso_extra);
      setSelected(d);
      setIsReadOnly(false);
      setVista("form");
    } catch {
      toast.error("No se pudo cargar el detalle");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await eliminarIngreso(deleteId);
      toast.success("Ingreso extra eliminado correctamente");
      loadData();
    } catch {
      toast.error("No se pudo eliminar el registro");
    } finally {
      setDeleteId(null);
    }
  };

  const headerTitle = () => {
    if (vista === "list") return "Gestión de Ingresos Extras";
    if (isReadOnly) return "Detalle del Ingreso Extra";
    return selected ? "Editar Ingreso Extra" : "Registrar Ingresos Extras";
  };

  const totalPaginas = Math.max(1, Math.ceil(ingresos.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = ingresos.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={headerTitle()}
        subtitle={
          vista === "form"
            ? "Complete el formulario para registrar el ingreso"
            : "Control y seguimiento de todos los ingresos adicionales"
        }
        searchPlaceholder="Buscar por descripción, mes o año..."
        onSearch={vista === "list" ? (val) => setFilters((f) => ({ ...f, buscar: val })) : undefined}
        searchValue={vista === "list" ? filters.buscar : undefined}
        buttonLabel={vista === "list" ? "Nuevo Ingreso" : undefined}
        onButtonClick={handleNuevo}
      />

      {/* ── Vista FORM ── */}
      {vista === "form" ? (
        <IngresoExtraForm
          initialData={selected}
          isReadOnly={isReadOnly}
          onCancel={() => setVista("list")}
          onSuccess={handleFormSuccess}
        />
      ) : (
        /* ── Vista LIST ── */
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="Total Ingresos Fletes"
              value={`${fmt(totales.totalFletes)} Bs`}
              icon={<Truck size={22} />}
              borderColor="border-[var(--yuriana-card-border)]"
              iconBg="bg-orange-50"
              iconColor="text-[var(--yuriana-base-orange)]"
            />
            <StatCard
              label="Total Ingresos Extras"
              value={`${fmt(totales.totalIngresoExtras)} Bs`}
              icon={<TrendingUp size={22} />}
              borderColor="border-emerald-200"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
            />
          </div>

          {/* Panel */}
          <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Filtros */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                  <input
                    type="date"
                    value={filters.fecha_inicio ?? ""}
                    onChange={(e) => setFilters((f) => ({ ...f, fecha_inicio: e.target.value }))}
                    className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]"
                  />
                  <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                  <input
                    type="date"
                    value={filters.fecha_fin ?? ""}
                    onChange={(e) => setFilters((f) => ({ ...f, fecha_fin: e.target.value }))}
                    className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]"
                  />
                </div>
                <ResetFiltersButton onClick={handleResetFilters} />
              </div>

              {loading ? (
                <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">
                  Cargando registros...
                </div>
              ) : (
                <IngresoExtraTable
                  data={registrosPagina}
                  onView={handleVer}
                  onEdit={handleEditar}
                  onDelete={(id) => setDeleteId(id)}
                />
              )}
              <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={ingresos.length} registrosMostrados={registrosPagina.length} onPageChange={setPagina} />
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <DeleteModal onConfirm={handleConfirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}
