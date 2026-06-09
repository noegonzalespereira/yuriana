"use client";
import { useState, useEffect, useCallback } from "react";
import { XCircle, TrendingDown, Wrench, Building2, Layers } from "lucide-react";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { FilterSelect } from "@/components/atoms/FilterSelect";
import { TablePagination } from "@/components/molecules/TablePagination";
import { toast } from "sonner";

const PAGE_SIZE = 10;
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { GastoServicioTable } from "@/components/organisms/GastoServicioTable";
import { GastoServicioForm } from "@/components/organisms/GastoServicioForm";
import { GastoOperativoTable } from "@/components/organisms/GastoOperativoTable";
import { GastoOperativoForm } from "@/components/organisms/GastoOperativoForm";
import { GastoAdministrativoTable } from "@/components/organisms/GastoAdministrativoTable";
import { GastoAdministrativoForm } from "@/components/organisms/GastoAdministrativoForm";
import { GastoGeneralTable } from "@/components/organisms/GastoGeneralTable";
import { GastoGeneralForm } from "@/components/organisms/GastoGeneralForm";
import {
  getTotalesPaneles,
  getGastosServicio,
  getDetalleGastoServicio,
  eliminarGastoServicio,
  getGastosOperativos,
  getDetalleGastoOperativo,
  eliminarGastoOperativo,
  getGastosAdministrativos,
  getDetalleGastoAdministrativo,
  eliminarGastoAdministrativo,
  getGastosGenerales,
  getDetalleGastoGeneral,
  eliminarGastoGeneral,
  type GastoFilters,
} from "@/lib/api/gasto.api";
import { GastosServicio, GastoOperativo, GastoAdministrativo, GastoGeneral, TotalesPaneles, TipoPestana, TipoGastoOperativo, TipoGastoAdministrativo, TipoGastoGeneral } from "@/types/gasto.types";

type Vista = "list" | "form";
type TabActiva = TipoPestana;

const TABS: { key: TabActiva; label: string }[] = [
  { key: TipoPestana.SERVICIO,       label: "Costos del Servicio" },
  { key: TipoPestana.OPERATIVO,      label: "Gastos Operativos" },
  { key: TipoPestana.ADMINISTRATIVO, label: "Gastos Administrativos" },
  { key: TipoPestana.GENERAL,        label: "Gastos Generales" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

// ── Modal de confirmación de eliminación ──────────────────────────────────
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
          Este gasto será desactivado del sistema. Esta acción no puede deshacerse.
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

export default function GastosPage() {
  const [vista, setVista] = useState<Vista>("list");
  const [tabActiva, setTabActiva] = useState<TabActiva>(TipoPestana.SERVICIO);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [totales, setTotales] = useState<TotalesPaneles>({
    totalGastosViaje: 0,
    totalGastosOperativos: 0,
    totalGastosAdministrativos: 0,
    totalGastosGenerales: 0,
  });

  // ── Servicio ──
  const INIT_SERVICIO: GastoFilters = { buscar: "", fecha_inicio: "", fecha_fin: "" };
  const INIT_OPERATIVO: GastoFilters = { buscar: "", fecha_inicio: "", fecha_fin: "", tipo_gasto: "" };
  const INIT_ADMIN: GastoFilters    = { fecha_inicio: "", fecha_fin: "", tipo_gasto: "" };
  const INIT_GENERAL: GastoFilters  = { fecha_inicio: "", fecha_fin: "", tipo_gasto: "" };

  const [gastosServicio, setGastosServicio] = useState<GastosServicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<GastosServicio | null>(null);
  const [filtersServicio, setFiltersServicio] = useState<GastoFilters>(INIT_SERVICIO);
  const [deleteServicioId, setDeleteServicioId] = useState<number | null>(null);

  // ── Operativo ──
  const [gastosOperativos, setGastosOperativos] = useState<GastoOperativo[]>([]);
  const [selectedOperativo, setSelectedOperativo] = useState<GastoOperativo | null>(null);
  const [filtersOperativo, setFiltersOperativo] = useState<GastoFilters>(INIT_OPERATIVO);
  const [deleteOperativoId, setDeleteOperativoId] = useState<number | null>(null);

  // ── Administrativo ──
  const [gastosAdmin, setGastosAdmin] = useState<GastoAdministrativo[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<GastoAdministrativo | null>(null);
  const [filtersAdmin, setFiltersAdmin] = useState<GastoFilters>(INIT_ADMIN);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);

  // ── General ──
  const [gastosGenerales, setGastosGenerales] = useState<GastoGeneral[]>([]);
  const [selectedGeneral, setSelectedGeneral] = useState<GastoGeneral | null>(null);
  const [filtersGeneral, setFiltersGeneral] = useState<GastoFilters>(INIT_GENERAL);
  const [deleteGeneralId, setDeleteGeneralId] = useState<number | null>(null);

  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [tabActiva]);
  useEffect(() => { setPagina(1); }, [filtersServicio]);
  useEffect(() => { setPagina(1); }, [filtersOperativo]);
  useEffect(() => { setPagina(1); }, [filtersAdmin]);
  useEffect(() => { setPagina(1); }, [filtersGeneral]);

  const handleResetFilters = () => {
    if (tabActiva === TipoPestana.SERVICIO)       setFiltersServicio(INIT_SERVICIO);
    if (tabActiva === TipoPestana.OPERATIVO)      setFiltersOperativo(INIT_OPERATIVO);
    if (tabActiva === TipoPestana.ADMINISTRATIVO) setFiltersAdmin(INIT_ADMIN);
    if (tabActiva === TipoPestana.GENERAL)        setFiltersGeneral(INIT_GENERAL);
  };

  // ── Cargar listado según pestaña activa ──
  const loadServicioData = useCallback(async () => {
    try {
      setLoading(true);
      const [tots, list] = await Promise.all([getTotalesPaneles(), getGastosServicio(filtersServicio)]);
      setTotales(tots);
      setGastosServicio(list);
    } catch {
      toast.error("Error al cargar los gastos del servicio");
    } finally {
      setLoading(false);
    }
  }, [filtersServicio]);

  const loadOperativoData = useCallback(async () => {
    try {
      setLoading(true);
      const [tots, list] = await Promise.all([getTotalesPaneles(), getGastosOperativos(filtersOperativo)]);
      setTotales(tots);
      setGastosOperativos(list);
    } catch {
      toast.error("Error al cargar los gastos operativos");
    } finally {
      setLoading(false);
    }
  }, [filtersOperativo]);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [tots, list] = await Promise.all([getTotalesPaneles(), getGastosAdministrativos(filtersAdmin)]);
      setTotales(tots);
      setGastosAdmin(list);
    } catch {
      toast.error("Error al cargar los gastos administrativos");
    } finally {
      setLoading(false);
    }
  }, [filtersAdmin]);

  const loadGeneralData = useCallback(async () => {
    try {
      setLoading(true);
      const [tots, list] = await Promise.all([getTotalesPaneles(), getGastosGenerales(filtersGeneral)]);
      setTotales(tots);
      setGastosGenerales(list);
    } catch {
      toast.error("Error al cargar los gastos generales");
    } finally {
      setLoading(false);
    }
  }, [filtersGeneral]);

  useEffect(() => {
    if (tabActiva === TipoPestana.SERVICIO) loadServicioData();
    if (tabActiva === TipoPestana.OPERATIVO) loadOperativoData();
    if (tabActiva === TipoPestana.ADMINISTRATIVO) loadAdminData();
    if (tabActiva === TipoPestana.GENERAL) loadGeneralData();
  }, [tabActiva, loadServicioData, loadOperativoData, loadAdminData, loadGeneralData]);

  // ── Handlers genéricos ──
  const handleNuevoGasto = () => {
    setSelectedServicio(null);
    setSelectedOperativo(null);
    setSelectedAdmin(null);
    setSelectedGeneral(null);
    setIsReadOnly(false);
    setVista("form");
  };

  const handleFormSuccess = () => {
    setVista("list");
    if (tabActiva === TipoPestana.SERVICIO) loadServicioData();
    if (tabActiva === TipoPestana.OPERATIVO) loadOperativoData();
    if (tabActiva === TipoPestana.ADMINISTRATIVO) loadAdminData();
    if (tabActiva === TipoPestana.GENERAL) loadGeneralData();
  };

  // ── Handlers Servicio ──
  const handleVerServicio = async (item: GastosServicio) => {
    try {
      const d = await getDetalleGastoServicio(item.id_gasto_servicio);
      setSelectedServicio(d);
      setIsReadOnly(true);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleEditarServicio = async (item: GastosServicio) => {
    try {
      const d = await getDetalleGastoServicio(item.id_gasto_servicio);
      setSelectedServicio(d);
      setIsReadOnly(false);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleConfirmDeleteServicio = async () => {
    if (!deleteServicioId) return;
    try {
      await eliminarGastoServicio(deleteServicioId);
      toast.success("Registro eliminado correctamente");
      loadServicioData();
    } catch { toast.error("No se pudo eliminar el registro"); }
    finally { setDeleteServicioId(null); }
  };

  // ── Handlers Operativo ──
  const handleVerOperativo = async (item: GastoOperativo) => {
    try {
      const d = await getDetalleGastoOperativo(item.id_gasto_operativo);
      setSelectedOperativo(d);
      setIsReadOnly(true);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleEditarOperativo = async (item: GastoOperativo) => {
    try {
      const d = await getDetalleGastoOperativo(item.id_gasto_operativo);
      setSelectedOperativo(d);
      setIsReadOnly(false);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleConfirmDeleteOperativo = async () => {
    if (!deleteOperativoId) return;
    try {
      await eliminarGastoOperativo(deleteOperativoId);
      toast.success("Gasto operativo eliminado correctamente");
      loadOperativoData();
    } catch { toast.error("No se pudo eliminar el registro"); }
    finally { setDeleteOperativoId(null); }
  };

  // ── Handlers Administrativo ──
  const handleVerAdmin = async (item: GastoAdministrativo) => {
    try {
      const d = await getDetalleGastoAdministrativo(item.id_gasto_admin);
      setSelectedAdmin(d);
      setIsReadOnly(true);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleEditarAdmin = async (item: GastoAdministrativo) => {
    try {
      const d = await getDetalleGastoAdministrativo(item.id_gasto_admin);
      setSelectedAdmin(d);
      setIsReadOnly(false);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleConfirmDeleteAdmin = async () => {
    if (!deleteAdminId) return;
    try {
      await eliminarGastoAdministrativo(deleteAdminId);
      toast.success("Gasto administrativo eliminado correctamente");
      loadAdminData();
    } catch { toast.error("No se pudo eliminar el registro"); }
    finally { setDeleteAdminId(null); }
  };

  // ── Handlers General ──
  const handleVerGeneral = async (item: GastoGeneral) => {
    try {
      const d = await getDetalleGastoGeneral(item.id_gasto_general);
      setSelectedGeneral(d);
      setIsReadOnly(true);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleEditarGeneral = async (item: GastoGeneral) => {
    try {
      const d = await getDetalleGastoGeneral(item.id_gasto_general);
      setSelectedGeneral(d);
      setIsReadOnly(false);
      setVista("form");
    } catch { toast.error("No se pudo cargar el detalle"); }
  };

  const handleConfirmDeleteGeneral = async () => {
    if (!deleteGeneralId) return;
    try {
      await eliminarGastoGeneral(deleteGeneralId);
      toast.success("Gasto general eliminado correctamente");
      loadGeneralData();
    } catch { toast.error("No se pudo eliminar el registro"); }
    finally { setDeleteGeneralId(null); }
  };

  // ── Título del header según contexto ──
  const headerTitle = () => {
    if (vista === "list") return "Gestión de Gastos";
    if (isReadOnly) return "Detalle del Gasto";
    if (tabActiva === TipoPestana.SERVICIO) return selectedServicio ? "Editar Gasto del Viaje" : "Registrar Gastos del Viaje";
    if (tabActiva === TipoPestana.OPERATIVO) return selectedOperativo ? "Editar Gasto Operativo" : "Registrar Gastos Operativos";
    if (tabActiva === TipoPestana.ADMINISTRATIVO) return selectedAdmin ? "Editar Gasto Administrativo" : "Registrar Gastos Administrativos";
    if (tabActiva === TipoPestana.GENERAL) return selectedGeneral ? "Editar Gasto General" : "Registrar Gastos Generales";
    return "Registrar Gasto";
  };

  const adminFiltrados = filtersAdmin.tipo_gasto
    ? gastosAdmin.filter((g: any) => g.tipo_gasto === filtersAdmin.tipo_gasto)
    : gastosAdmin;
  const generalesFiltrados = filtersGeneral.tipo_gasto
    ? gastosGenerales.filter((g: any) => g.tipo_gasto === filtersGeneral.tipo_gasto)
    : gastosGenerales;
  const activeData =
    tabActiva === TipoPestana.SERVICIO       ? gastosServicio :
    tabActiva === TipoPestana.OPERATIVO      ? gastosOperativos :
    tabActiva === TipoPestana.ADMINISTRATIVO ? adminFiltrados :
    generalesFiltrados;
  const totalPaginas = Math.max(1, Math.ceil(activeData.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const pageStart = (paginaActual - 1) * PAGE_SIZE;
  const pageEnd = paginaActual * PAGE_SIZE;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={headerTitle()}
        subtitle={vista === "form" ? "Complete el formulario para registrar el gasto" : "Control y seguimiento de todos los egresos operacionales"}
        searchPlaceholder="Buscar..."
        onSearch={
          vista === "list" && tabActiva === TipoPestana.SERVICIO
            ? (val) => setFiltersServicio((f) => ({ ...f, buscar: val }))
            : vista === "list" && tabActiva === TipoPestana.OPERATIVO
            ? (val) => setFiltersOperativo((f) => ({ ...f, buscar: val }))
            : undefined
        }
        searchValue={
          vista === "list" && tabActiva === TipoPestana.SERVICIO ? (filtersServicio.buscar ?? "") :
          vista === "list" && tabActiva === TipoPestana.OPERATIVO ? (filtersOperativo.buscar ?? "") :
          undefined
        }
      />

      {/* ── Vista FORM ── */}
      {vista === "form" ? (
        tabActiva === TipoPestana.SERVICIO ? (
          <GastoServicioForm
            initialData={selectedServicio}
            isReadOnly={isReadOnly}
            onCancel={() => setVista("list")}
            onSuccess={handleFormSuccess}
          />
        ) : tabActiva === TipoPestana.OPERATIVO ? (
          <GastoOperativoForm
            initialData={selectedOperativo}
            isReadOnly={isReadOnly}
            onCancel={() => setVista("list")}
            onSuccess={handleFormSuccess}
          />
        ) : tabActiva === TipoPestana.ADMINISTRATIVO ? (
          <GastoAdministrativoForm
            initialData={selectedAdmin}
            isReadOnly={isReadOnly}
            onCancel={() => setVista("list")}
            onSuccess={handleFormSuccess}
          />
        ) : tabActiva === TipoPestana.GENERAL ? (
          <GastoGeneralForm
            initialData={selectedGeneral}
            isReadOnly={isReadOnly}
            onCancel={() => setVista("list")}
            onSuccess={handleFormSuccess}
          />
        ) : null
      ) : (
        /* ── Vista LIST ── */
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Gastos de Viaje"         value={`${fmt(totales.totalGastosViaje)} Bs`}           icon={<TrendingDown size={22} />} borderColor="border-[var(--yuriana-card-border)]" iconBg="bg-orange-50"  iconColor="text-[var(--yuriana-base-orange)]" />
            <StatCard label="Total Gastos Operativos"       value={`${fmt(totales.totalGastosOperativos)} Bs`}       icon={<Wrench size={22} />}      borderColor="border-blue-200"   iconBg="bg-blue-50"   iconColor="text-blue-500" />
            <StatCard label="Total Gastos Administrativos"  value={`${fmt(totales.totalGastosAdministrativos)} Bs`}  icon={<Building2 size={22} />}   borderColor="border-purple-200" iconBg="bg-purple-50" iconColor="text-purple-500" />
            <StatCard label="Total Gastos Generales"        value={`${fmt(totales.totalGastosGenerales)} Bs`}        icon={<Layers size={22} />}      borderColor="border-amber-200"  iconBg="bg-amber-50"  iconColor="text-[var(--yuriana-base-yellow)]" />
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
              {/* ── Costos del Servicio ── */}
              {tabActiva === TipoPestana.SERVICIO && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                      <input type="date" value={filtersServicio.fecha_inicio ?? ""} onChange={(e) => setFiltersServicio((f) => ({ ...f, fecha_inicio: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                      <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                      <input type="date" value={filtersServicio.fecha_fin ?? ""} onChange={(e) => setFiltersServicio((f) => ({ ...f, fecha_fin: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                    </div>
                    <ResetFiltersButton onClick={handleResetFilters} />
                    <div className="ml-auto">
                      <button type="button" onClick={handleNuevoGasto} className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black py-2 px-5 rounded-xl shadow text-xs transition-all active:scale-95">
                        + Nuevo Gasto
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">Cargando registros...</div>
                  ) : (
                    <>
                      <GastoServicioTable data={gastosServicio.slice(pageStart, pageEnd)} onView={handleVerServicio} onEdit={handleEditarServicio} onDelete={(id) => setDeleteServicioId(id)} />
                      <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={gastosServicio.length} registrosMostrados={gastosServicio.slice(pageStart, pageEnd).length} onPageChange={setPagina} />
                    </>
                  )}
                </div>
              )}

              {/* ── Gastos Operativos ── */}
              {tabActiva === TipoPestana.OPERATIVO && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                      <input type="date" value={filtersOperativo.fecha_inicio ?? ""} onChange={(e) => setFiltersOperativo((f) => ({ ...f, fecha_inicio: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                      <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                      <input type="date" value={filtersOperativo.fecha_fin ?? ""} onChange={(e) => setFiltersOperativo((f) => ({ ...f, fecha_fin: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                    </div>
                    <FilterSelect
                      placeholder="Tipo de Gasto"
                      value={filtersOperativo.tipo_gasto ?? ""}
                      options={[
                        { value: TipoGastoOperativo.MANTENIMIENTO, label: "Mantenimiento" },
                        { value: TipoGastoOperativo.COMBUSTIBLE, label: "Combustible" },
                        { value: TipoGastoOperativo.REPUESTOS, label: "Repuestos" },
                      ]}
                      onChange={(v) => setFiltersOperativo((f) => ({ ...f, tipo_gasto: v }))}
                    />
                    <ResetFiltersButton onClick={handleResetFilters} />
                    <div className="ml-auto">
                      <button type="button" onClick={handleNuevoGasto} className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black py-2 px-5 rounded-xl shadow text-xs transition-all active:scale-95">
                        + Nuevo Gasto
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">Cargando registros...</div>
                  ) : (
                    <>
                      <GastoOperativoTable data={gastosOperativos.slice(pageStart, pageEnd)} onView={handleVerOperativo} onEdit={handleEditarOperativo} onDelete={(id) => setDeleteOperativoId(id)} />
                      <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={gastosOperativos.length} registrosMostrados={gastosOperativos.slice(pageStart, pageEnd).length} onPageChange={setPagina} />
                    </>
                  )}
                </div>
              )}

              {/* ── Gastos Administrativos ── */}
              {tabActiva === TipoPestana.ADMINISTRATIVO && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                      <input type="date" value={filtersAdmin.fecha_inicio ?? ""} onChange={(e) => setFiltersAdmin((f) => ({ ...f, fecha_inicio: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                      <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                      <input type="date" value={filtersAdmin.fecha_fin ?? ""} onChange={(e) => setFiltersAdmin((f) => ({ ...f, fecha_fin: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                    </div>
                    <FilterSelect
                      placeholder="Tipo de Gasto"
                      value={filtersAdmin.tipo_gasto ?? ""}
                      options={[
                        { value: TipoGastoAdministrativo.CONTADOR, label: "Contador" },
                        { value: TipoGastoAdministrativo.IMPUESTO, label: "Impuesto" },
                        { value: TipoGastoAdministrativo.GPS, label: "GPS" },
                        { value: TipoGastoAdministrativo.SUELDO_CONDUCTORES, label: "Sueldo Conductores" },
                        { value: TipoGastoAdministrativo.OTROS, label: "Otros" },
                      ]}
                      onChange={(v) => setFiltersAdmin((f) => ({ ...f, tipo_gasto: v }))}
                    />
                    <ResetFiltersButton onClick={handleResetFilters} />
                    <div className="ml-auto">
                      <button type="button" onClick={handleNuevoGasto} className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black py-2 px-5 rounded-xl shadow text-xs transition-all active:scale-95">
                        + Nuevo Gasto
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">Cargando registros...</div>
                  ) : (
                    <>
                      <GastoAdministrativoTable data={adminFiltrados.slice(pageStart, pageEnd)} onView={handleVerAdmin} onEdit={handleEditarAdmin} onDelete={(id) => setDeleteAdminId(id)} />
                      <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={adminFiltrados.length} registrosMostrados={adminFiltrados.slice(pageStart, pageEnd).length} onPageChange={setPagina} />
                    </>
                  )}
                </div>
              )}

              {/* ── Gastos Generales ── */}
              {tabActiva === TipoPestana.GENERAL && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2 bg-[var(--yuriana-input-bg)]">
                      <input type="date" value={filtersGeneral.fecha_inicio ?? ""} onChange={(e) => setFiltersGeneral((f) => ({ ...f, fecha_inicio: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                      <span className="text-[var(--yuriana-input-placeholder)] text-xs">-</span>
                      <input type="date" value={filtersGeneral.fecha_fin ?? ""} onChange={(e) => setFiltersGeneral((f) => ({ ...f, fecha_fin: e.target.value }))} className="text-xs outline-none bg-transparent text-[var(--yuriana-input-text)]" />
                    </div>
                    <FilterSelect
                      placeholder="Tipo de Gasto"
                      value={filtersGeneral.tipo_gasto ?? ""}
                      options={[
                        { value: TipoGastoGeneral.TALLER, label: "Taller" },
                        { value: TipoGastoGeneral.LLANTAS, label: "Llantas" },
                        { value: TipoGastoGeneral.OTROS, label: "Otros" },
                      ]}
                      onChange={(v) => setFiltersGeneral((f) => ({ ...f, tipo_gasto: v }))}
                    />
                    <ResetFiltersButton onClick={handleResetFilters} />
                    <div className="ml-auto">
                      <button type="button" onClick={handleNuevoGasto} className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black py-2 px-5 rounded-xl shadow text-xs transition-all active:scale-95">
                        + Nuevo Gasto
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic text-xs font-medium">Cargando registros...</div>
                  ) : (
                    <>
                      <GastoGeneralTable data={generalesFiltrados.slice(pageStart, pageEnd)} onView={handleVerGeneral} onEdit={handleEditarGeneral} onDelete={(id) => setDeleteGeneralId(id)} />
                      <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={generalesFiltrados.length} registrosMostrados={generalesFiltrados.slice(pageStart, pageEnd).length} onPageChange={setPagina} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminación — Servicio */}
      {deleteServicioId !== null && (
        <DeleteModal
          onConfirm={handleConfirmDeleteServicio}
          onCancel={() => setDeleteServicioId(null)}
        />
      )}

      {/* Modal eliminación — Operativo */}
      {deleteOperativoId !== null && (
        <DeleteModal
          onConfirm={handleConfirmDeleteOperativo}
          onCancel={() => setDeleteOperativoId(null)}
        />
      )}

      {/* Modal eliminación — Administrativo */}
      {deleteAdminId !== null && (
        <DeleteModal
          onConfirm={handleConfirmDeleteAdmin}
          onCancel={() => setDeleteAdminId(null)}
        />
      )}

      {/* Modal eliminación — General */}
      {deleteGeneralId !== null && (
        <DeleteModal
          onConfirm={handleConfirmDeleteGeneral}
          onCancel={() => setDeleteGeneralId(null)}
        />
      )}
    </div>
  );
}
