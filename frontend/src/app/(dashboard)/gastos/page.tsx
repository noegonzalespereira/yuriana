"use client";
import { useState, useEffect, useCallback } from "react";
import { XCircle, TrendingDown, Wrench, Building2, Layers } from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { GastoServicioTable } from "@/components/organisms/GastoServicioTable";
import { GastoServicioForm } from "@/components/organisms/GastoServicioForm";
import {
  getTotalesPaneles,
  getGastosServicio,
  getDetalleGastoServicio,
  eliminarGastoServicio,
  type GastoFilters,
} from "@/lib/api/gasto.api";
import { GastosServicio, TotalesPaneles, TipoPestana } from "@/types/gasto.types";

type Vista = "list" | "form";
type TabActiva = TipoPestana;

const TABS: { key: TabActiva; label: string }[] = [
  { key: TipoPestana.SERVICIO, label: "Costos del Servicio" },
  { key: TipoPestana.OPERATIVO, label: "Gastos Operativos" },
  { key: TipoPestana.ADMINISTRATIVO, label: "Gastos Administrativos" },
  { key: TipoPestana.GENERAL, label: "Gastos Generales" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

export default function GastosPage() {
  const [vista, setVista] = useState<Vista>("list");
  const [tabActiva, setTabActiva] = useState<TabActiva>(TipoPestana.SERVICIO);
  const [loading, setLoading] = useState(true);

  const [totales, setTotales] = useState<TotalesPaneles>({
    totalGastosViaje: 0,
    totalGastosOperativos: 0,
    totalGastosAdministrativos: 0,
    totalGastosGenerales: 0,
  });

  const [gastosServicio, setGastosServicio] = useState<GastosServicio[]>([]);
  const [selectedGasto, setSelectedGasto] = useState<GastosServicio | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [filters, setFilters] = useState<GastoFilters>({ buscar: "", fecha_inicio: "", fecha_fin: "" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null);

  const loadServicioData = useCallback(async () => {
    try {
      setLoading(true);
      const [tots, list] = await Promise.all([
        getTotalesPaneles(),
        getGastosServicio(filters),
      ]);
      setTotales(tots);
      setGastosServicio(list);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los gastos");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (tabActiva === TipoPestana.SERVICIO) loadServicioData();
  }, [tabActiva, loadServicioData]);

  const handleNuevoGasto = () => {
    setSelectedGasto(null);
    setIsReadOnly(false);
    setVista("form");
  };

  const handleVerDetalle = async (item: GastosServicio) => {
    try {
      const detalle = await getDetalleGastoServicio(item.id_gasto_servicio);
      setSelectedGasto(detalle);
      setIsReadOnly(true);
      setVista("form");
    } catch {
      toast.error("No se pudo cargar el detalle");
    }
  };

  const handleEditar = async (item: GastosServicio) => {
    try {
      const detalle = await getDetalleGastoServicio(item.id_gasto_servicio);
      setSelectedGasto(detalle);
      setIsReadOnly(false);
      setVista("form");
    } catch {
      toast.error("No se pudo cargar el detalle para edición");
    }
  };

  const handleOpenDelete = (id: number) => {
    setIdParaEliminar(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!idParaEliminar) return;
    try {
      await eliminarGastoServicio(idParaEliminar);
      toast.success("Registro eliminado correctamente");
      loadServicioData();
    } catch {
      toast.error("No se pudo eliminar el registro");
    } finally {
      setShowDeleteModal(false);
      setIdParaEliminar(null);
    }
  };

  const handleFormSuccess = () => {
    setVista("list");
    loadServicioData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={vista === "list" ? "Gestión de Gastos" : isReadOnly ? "Detalle del Gasto" : selectedGasto ? "Editar Gasto" : "Registrar los gastos del viaje"}
        subtitle={vista === "form" ? "Complete el formulario para registrar los costos del servicio" : "Control y seguimiento de todos los egresos operacionales"}
        searchPlaceholder="Buscar por código de viaje..."
        onSearch={vista === "list" ? (val) => setFilters((f) => ({ ...f, buscar: val })) : undefined}
        buttonLabel={vista === "list" && tabActiva === TipoPestana.SERVICIO ? "Nueva Gasto" : undefined}
        onButtonClick={handleNuevoGasto}
      />

      {vista === "form" ? (
        <GastoServicioForm
          initialData={selectedGasto}
          isReadOnly={isReadOnly}
          onCancel={() => setVista("list")}
          onSuccess={handleFormSuccess}
        />
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Gastos de Viaje"
              value={`${fmt(totales.totalGastosViaje)} Bs`}
              icon={<TrendingDown size={22} />}
              borderColor="border-[var(--yuriana-card-border)]"
              iconBg="bg-orange-50"
              iconColor="text-[var(--yuriana-base-orange)]"
            />
            <StatCard
              label="Total Gastos Operativos"
              value={`${fmt(totales.totalGastosOperativos)} Bs`}
              icon={<Wrench size={22} />}
              borderColor="border-blue-200"
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Total Gastos Administrativos"
              value={`${fmt(totales.totalGastosAdministrativos)} Bs`}
              icon={<Building2 size={22} />}
              borderColor="border-purple-200"
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              label="Total Gastos Generales"
              value={`${fmt(totales.totalGastosGenerales)} Bs`}
              icon={<Layers size={22} />}
              borderColor="border-amber-200"
              iconBg="bg-amber-50"
              iconColor="text-[var(--yuriana-base-yellow)]"
            />
          </div>

          {/* Tab panel */}
          <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTabActiva(tab.key)}
                  className={`px-6 py-4 text-sm font-black uppercase tracking-wide whitespace-nowrap transition-colors ${
                    tabActiva === tab.key
                      ? "text-[var(--yuriana-base-orange)] border-b-2 border-[var(--yuriana-base-orange)] -mb-px"
                      : "text-[var(--yuriana-input-placeholder)] hover:text-[var(--yuriana-base-gray-dark)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Costos del Servicio */}
              {tabActiva === TipoPestana.SERVICIO && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                      <input
                        type="date"
                        value={filters.fecha_inicio ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, fecha_inicio: e.target.value }))}
                        className="text-sm outline-none bg-transparent text-[var(--yuriana-input-text)]"
                      />
                      <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                      <input
                        type="date"
                        value={filters.fecha_fin ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, fecha_fin: e.target.value }))}
                        className="text-sm outline-none bg-transparent text-[var(--yuriana-input-text)]"
                      />
                    </div>
                    
                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={handleNuevoGasto}
                        className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black py-2 px-5 rounded-xl shadow text-sm transition-all active:scale-95"
                      >
                        + Nueva Gasto
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-sm font-medium">
                      Cargando registros...
                    </div>
                  ) : (
                    <>
                      <GastoServicioTable
                        data={gastosServicio}
                        onView={handleVerDetalle}
                        onEdit={handleEditar}
                        onDelete={handleOpenDelete}
                      />
                      <p className="text-xs text-[var(--yuriana-input-placeholder)] font-medium">
                        Mostrando {gastosServicio.length} registro{gastosServicio.length !== 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Tabs pendientes */}
              {tabActiva !== TipoPestana.SERVICIO && (
                <div className="py-20 text-center space-y-2">
                  <p className="text-[var(--yuriana-input-placeholder)] italic text-sm font-medium">
                    Módulo en construcción
                  </p>
                  <p className="text-[10px] text-[var(--yuriana-input-placeholder)]">
                    {TABS.find((t) => t.key === tabActiva)?.label} estará disponible próximamente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300 mx-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100/60 shadow-inner">
              <XCircle size={32} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">
                ¿Eliminar este registro?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[320px] mx-auto">
                Este gasto de servicio será desactivado del sistema. Esta acción no puede deshacerse.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setIdParaEliminar(null); }}
                className="w-full py-3.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-98"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-3.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-500/10 active:scale-98"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
