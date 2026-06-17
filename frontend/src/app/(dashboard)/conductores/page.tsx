"use client";
import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { FilterSelect } from "@/components/atoms/FilterSelect";
import { ConductorTable } from "@/components/organisms/ConductorTable";
import { ConductorForm } from "@/components/organisms/ConductorForm";
import { ModuleAlertsPanel } from "@/components/organisms/ModuleAlertsPanel";
import {
  getConductores,
  getConductorContador,
  deleteConductor,
  updateConductor,
  registrarConductor,
  uploadDocumentoConductor,
} from "@/lib/api/conductor.api";
import { toast } from "sonner";
import { Conductor, EstadoLaboral } from "@/types/conductor.types";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { TablePagination } from "@/components/molecules/TablePagination";

const PAGE_SIZE = 10;

export default function ConductoresPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(true);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [vencidos, setVencidos] = useState<any[]>([]);
  const [porVencer, setPorVencer] = useState<any[]>([]);

  const INITIAL_FILTERS = { nombre: "", estado_laboral: "", estado_operativo: "", estado_documentos: "" };
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const handleResetFilters = () => setFilters(INITIAL_FILTERS);
  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [filters]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ciParaEliminar, setCiParaEliminar] = useState<number | null>(null);

  const cargarAlertas = useCallback(async () => {
    try {
      const todos = await getConductores({});
      setVencidos(
        todos
          .filter((c: Conductor) => c.estado === 'vencido')
          .map((c: Conductor) => ({
            id_documento: c.id_conductor,
            nombre_documento: c.documento_critico || "Licencia de Conducir / Categoría",
            entityId: c.persona.ci?.toString() || '0',
            entityName: c.persona.nombre.trim(),
            entityType: 'conductor'
          }))
      );
      setPorVencer(
        todos
          .filter((c: Conductor) => c.estado === 'por_vencer')
          .map((c: Conductor) => ({
            id_documento: c.id_conductor,
            nombre_documento: c.documento_critico || "Vigencia de Categoría",
            entityId: c.persona.ci?.toString() || '0',
            entityName: c.persona.nombre.trim(),
            entityType: 'conductor',
            dias_restantes: c.dias_restantes ?? null
          }))
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarTabla = useCallback(async () => {
    try {
      setLoading(true);
      const [listConductores, totalCounters] = await Promise.all([
        getConductores(filters),
        getConductorContador()
      ]);
      setConductores(listConductores);
      setStats(totalCounters);
    } catch (err) {
      console.error("ERROR AL CARGAR FLUJO OPERATIVO DE CONDUCTORES:", err);
      toast.error("Error al cargar", {
        description: "No se pudo obtener la lista de conductores."
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadPageData = useCallback(async () => {
    await Promise.all([cargarTabla(), cargarAlertas()]);
  }, [cargarTabla, cargarAlertas]);

  // Carga inicial: tabla + alertas
  useEffect(() => {
    cargarAlertas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarga solo la tabla cuando cambian los filtros
  useEffect(() => {
    cargarTabla();
  }, [cargarTabla]);

  const handleFormSubmitUnificado = async (
    payloadConductor: any,
    archivos: Record<number, File>,
    fechas: Record<number, string>,
  ) => {
    try {
      if (selectedConductor) {
        // ACTUALIZAR: conductor ya existe, no hay riesgo de huérfanos
        await updateConductor(selectedConductor.persona.ci, payloadConductor);

        const todosLosIds = Array.from(new Set([
          ...Object.keys(archivos).map(Number),
          ...Object.keys(fechas).map(Number),
        ]));
        for (const idReq of todosLosIds) {
          const fileObj = archivos[idReq];
          const fechaVenc = fechas[idReq];
          if (!fileObj && !fechaVenc) continue;
          const form = new FormData();
          form.append("id_requisito", idReq.toString());
          form.append("id_conductor", selectedConductor.id_conductor.toString());
          if (fileObj) form.append("file", fileObj);
          if (fechaVenc) form.append("fecha_vencimiento", new Date(fechaVenc).toISOString());
          await uploadDocumentoConductor(form);
        }
      } else {
        // CREAR: un solo endpoint con transacción real en el backend
        const formData = new FormData();
        Object.entries(payloadConductor).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, String(value));
        });
        Object.entries(archivos).forEach(([idRequisito, file]) => {
          formData.append(`archivo_${idRequisito}`, file);
        });
        Object.entries(fechas).forEach(([idRequisito, fecha]) => {
          formData.append(`fecha_${idRequisito}`, fecha);
        });
        await registrarConductor(formData);
      }

      toast.success("Operación Exitosa", {
        description: selectedConductor
          ? "Los datos del conductor se actualizaron correctamente."
          : "Conductor y expediente digital registrados con éxito.",
      });
      setView('list');
      loadPageData();

    } catch (error: any) {
      toast.error("Error de Sincronización", {
        description: error.message || "Verifique los datos e intente de nuevo.",
      });
    }
  };

  const handleOpenDeleteConfirmation = (ci: number) => {
    setCiParaEliminar(ci);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteEjecucion = async () => {
    if (ciParaEliminar) {
      try {
        await deleteConductor(ciParaEliminar);
        toast.success("Baja Lógica Procesada", { description: "El conductor ha sido desactivado del sistema." });
        loadPageData();
      } catch (err) {
        toast.error("Error Operacional", { description: "No se pudo procesar la baja del conductor." });
      } finally {
        setShowDeleteModal(false);
        setCiParaEliminar(null);
      }
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(conductores.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = conductores.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader 
        title={view === 'list' ? "Gestión de Conductores" : selectedConductor ? (isReadOnly ? "Datos del Conductor" : "Editar Conductor") : "Registrar Nuevo Conductor"}
        subtitle={view === 'form' ? "Complete el formulario para añadir un nuevo conductor" : "Monitoree las licencias y la vigencia operacional del personal"}
        searchPlaceholder="Buscar por nombre o CI..."
        onSearch={view === 'list' ? (val) => setFilters({ ...filters, nombre: val }) : undefined}
        searchValue={view === 'list' ? filters.nombre : undefined}
        buttonLabel={view === 'list' ? "Nuevo Conductor" : undefined}
        onButtonClick={() => { setSelectedConductor(null); setIsReadOnly(false); setView('form'); }}
      />

      {view === 'list' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <StatCard label="Total Conductores" value={stats.total} icon={<Users size={24} />} borderColor="border-border" iconBg="bg-orange-50" iconColor="text-[var(--yuriana-base-orange)]" />
            <StatCard label="Activos" value={stats.activos} icon={<CheckCircle size={24} />} borderColor="border-emerald-200" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard label="Inactivos" value={stats.inactivos} icon={<XCircle size={24} />} borderColor="border-red-200" iconBg="bg-red-50" iconColor="text-[var(--yuriana-input-error)]" />
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-border min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-700 uppercase tracking-tighter text-sm px-2">Listado de Conductores</h2>
              <div className="flex items-center gap-3">
                <FilterSelect placeholder="Estado Laboral" value={filters.estado_laboral} options={[{ value: EstadoLaboral.ACTIVO, label: "Activo" }, { value: EstadoLaboral.INACTIVO, label: "Inactivo" }]} onChange={(v) => setFilters({ ...filters, estado_laboral: v })} />
                <FilterSelect placeholder="Documentos" value={filters.estado_documentos} options={[{ value: "vencido", label: "Vencidos" }, { value: "por_vencer", label: "Por Vencer" }, { value: "vigente", label: "Vigentes" }]} onChange={(v) => setFilters({ ...filters, estado_documentos: v })} />
                <ResetFiltersButton onClick={handleResetFilters} />
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center text-gray-400 italic text-sm font-medium">Sincronizando conductores...</div>
            ) : (
              <ConductorTable
                data={registrosPagina}
                onDelete={handleOpenDeleteConfirmation}
                onEdit={(c) => { setSelectedConductor(c); setIsReadOnly(false); setView('form'); }}
                onView={(c) => { setSelectedConductor(c); setIsReadOnly(true); setView('form'); }}
              />
            )}
            <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={conductores.length} registrosMostrados={registrosPagina.length} onPageChange={setPagina} />
          </div>

          <ModuleAlertsPanel 
            vencidos={vencidos}
            porVencer={porVencer}
            entityType="conductor"
            onAction={(ci) => setFilters({ ...filters, nombre: ci })}
          />
        </div>
      ) : (
        <ConductorForm 
          initialData={selectedConductor}
          isReadOnly={isReadOnly}
          onSubmit={handleFormSubmitUnificado}
          onCancel={() => setView('list')}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300 mx-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100/60 shadow-inner">
              <XCircle size={32} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">¿Confirmar Baja del Conductor?</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[320px] mx-auto">El operario pasará a estar inactivo laboralmente, liberando cualquier enganche vehicular de inmediato.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                type="button"
                onClick={() => { setShowDeleteModal(false); setCiParaEliminar(null); }} 
                className="w-full py-3.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-98"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirmDeleteEjecucion} 
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