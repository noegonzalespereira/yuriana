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
  createConductor, 
  updateConductor,
  getDocumentosVencidos,
  getDocumentosPorVencer
} from "@/lib/api/conductor.api";
import { toast } from "sonner";
import { Conductor, EstadoLaboral, EstadoOperativo } from "@/types/conductor.types";
import { Users, CheckCircle, XCircle } from "lucide-react";

export default function ConductoresPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(true);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [vencidos, setVencidos] = useState<any[]>([]);
  const [porVencer, setPorVencer] = useState<any[]>([]);
  const [filters, setFilters] = useState({ nombre: "", estado_laboral: "", estado_operativo: "", estado_documentos: "" });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ciParaEliminar, setCiParaEliminar] = useState<number | null>(null);

  const loadPageData = useCallback(async () => {
    try {
      setLoading(true);
      const [list, totalCounters, alertVencidos, alertPorVencer] = await Promise.all([
        getConductores(filters),
        getConductorContador(),
        getDocumentosVencidos(),
        getDocumentosPorVencer()
      ]);
      setConductores(list);
      setStats(totalCounters);
      
      setVencidos(alertVencidos.map(doc => ({
        id_documento: doc.id_documento,
        nombre_documento: doc.requisito_documento?.nombre_documento || "Documento",
        entityId: doc.conductor?.persona?.ci?.toString() || "0",
        entityName: doc.conductor?.persona?.nombre || "Chofer Desconocido"
      })));

      setPorVencer(alertPorVencer.map(doc => ({
        id_documento: doc.id_documento,
        nombre_documento: doc.requisito_documento?.nombre_documento || "Documento",
        entityId: doc.conductor?.persona?.ci?.toString() || "0",
        entityName: doc.conductor?.persona?.nombre || "Chofer Desconocido",
        dias_restantes: doc.dias_restantes
      })));
    } catch (err) {
      console.error("ERROR AL CARGAR FLUJO OPERATIVO DE CONDUCTORES:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const handleFormSubmitUnificado = async (payloadConductor: any, archivos: Record<number, File>, fechas: Record<number, string>) => {
    let conductorCreadoId: number | null = null;
    let conductorCreadoCi: number | null = null;

    try {
      let conductorPersistido: Conductor;
      
      if (selectedConductor) {
        conductorPersistido = await updateConductor(selectedConductor.persona.ci, payloadConductor);
        console.log("Información general del conductor actualizada.");
      } else {
        conductorPersistido = await createConductor(payloadConductor);
        conductorCreadoId = conductorPersistido.id_conductor;
        conductorCreadoCi = conductorPersistido.persona?.ci || payloadConductor.ci;
        console.log("Conductor registrado provisionalmente con ID:", conductorCreadoId);
      }

      const idConductorAsignado = selectedConductor ? selectedConductor.id_conductor : conductorCreadoId;
      const token = localStorage.getItem('yuriana_token');

      if (!token) throw new Error('No hay sesión activa. Por favor inicia sesión.');
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const todosLosIdsRequisitos = Array.from(new Set([
        ...Object.keys(archivos).map(Number),
        ...Object.keys(fechas).map(Number)
      ]));
      
      for (const idReqNum of todosLosIdsRequisitos) {
        const fileObj = archivos[idReqNum];
        const fechaVenc = fechas[idReqNum];

        if (!fileObj && !fechaVenc) continue;

        const formMultipart = new FormData();
        formMultipart.append("id_requisito", idReqNum.toString());
        formMultipart.append("id_conductor", idConductorAsignado!.toString());
        if (fileObj) formMultipart.append("file", fileObj);
        if (fechaVenc) formMultipart.append("fecha_vencimiento", new Date(fechaVenc).toISOString());

        console.log(`Enviando transacción documental para requisito ID ${idReqNum} al backend...`);
        
        const resUpload = await fetch(`${baseUrl}/documento`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formMultipart
        });

        if (!resUpload.ok) {
          const errRes = await resUpload.json().catch(() => ({ message: "Error en el formato o tamaño del archivo." }));
          throw new Error(errRes.message || `Fallo en el documento ID ${idReqNum}`);
        }
      }

      toast.success("Operación Exitosa", {
        description: selectedConductor ? "Los datos del operador se actualizaron correctamente." : "Conductor y expediente digital registrados con éxito."
      });
      setView('list');
      loadPageData();

    } catch (error: any) {
      console.error("ERROR CRÍTICO EN EL PROCESO DE REGISTRO:", error);
      
      toast.error("Error de Sincronización", {
        description: error.message || "Verifique los datos e intente de nuevo."
      });

      if (!selectedConductor && conductorCreadoCi) {
        console.warn(`Iniciando Rollback automático: eliminando conductor incompleto con CI: ${conductorCreadoCi}`);
        try {
          await deleteConductor(conductorCreadoCi);
        } catch (rollbackError) {
          console.error("Error crítico en Rollback:", rollbackError);
        }
      }
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader 
        title={view === 'list' ? "Gestión de Conductores" : selectedConductor ? (isReadOnly ? "Datos del Conductor" : "Editar Conductor") : "Registrar Nuevo Conductor"}
        subtitle={view === 'form' ? "Complete el formulario para añadir un nuevo conductor" : "Monitoree las licencias y la vigencia operacional del personal"}
        searchPlaceholder="Buscar por nombre o CI..."
        onSearch={view === 'list' ? (val) => setFilters({ ...filters, nombre: val }) : undefined}
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
              <h2 className="font-bold text-gray-700 uppercase tracking-tighter text-sm px-2">Listado de Operadores de Carga</h2>
              <div className="flex gap-4">
                <FilterSelect placeholder="Estado Laboral" options={[{ value: EstadoLaboral.ACTIVO, label: "Activo" }, { value: EstadoLaboral.INACTIVO, label: "Inactivo" }]} onChange={(v) => setFilters({ ...filters, estado_laboral: v })} />
                <FilterSelect placeholder="Documentos" options={[{ value: "vencido", label: "Vencidos" }, { value: "por_vencer", label: "Por Vencer" }, { value: "vigente", label: "Vigentes" }]} onChange={(v) => setFilters({ ...filters, estado_documentos: v })} />
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center text-gray-400 italic text-sm font-medium">Sincronizando operadores de viaje...</div>
            ) : (
              <ConductorTable 
                data={conductores}
                onDelete={handleOpenDeleteConfirmation}
                onEdit={(c) => { setSelectedConductor(c); setIsReadOnly(false); setView('form'); }}
                onView={(c) => { setSelectedConductor(c); setIsReadOnly(true); setView('form'); }}
              />
            )}
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

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN PERSONALIZADO */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-[var(--yuriana-input-error)] rounded-full flex items-center justify-center mx-auto border border-red-100">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tighter text-base">¿Confirmar Baja Lógica?</h3>
              <p className="text-xs text-gray-500 mt-1">El operador pasará a estado inactivo pero sus datos históricos se preservarán.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => { setShowDeleteModal(false); setCiParaEliminar(null); }} 
                className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirmDeleteEjecucion} 
                className="w-full py-2.5 bg-[var(--yuriana-input-error)] text-white rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-colors shadow-md"
              >
                Dar de Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}