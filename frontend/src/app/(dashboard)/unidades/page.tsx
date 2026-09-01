"use client";
import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { FilterSelect } from "@/components/atoms/FilterSelect";
import { UnidadTable } from "@/components/organisms/UnidadTable";
import { UnidadForm } from "@/components/organisms/UnidadForm";
import { ModuleAlertsPanel } from "@/components/organisms/ModuleAlertsPanel";
import {
  getUnidades,
  updateUnidad,
  deleteUnidad,
  getCategoriasEntidad,
  registrarUnidad,
  uploadDocumentoUnidad,
} from "@/lib/api/unidad.api";
import { toast } from "sonner";
import { Truck, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { TablePagination } from "@/components/molecules/TablePagination";
import { Unidad, EstadoUnidad } from "@/types/unidad.types";

const PAGE_SIZE = 10;

export default function UnidadesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(true);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [vencidos, setVencidos] = useState<any[]>([]);
  const [porVencer, setPorVencer] = useState<any[]>([]);

  const INITIAL_FILTERS = { placa: "", id_categoria: "", estado_unidad: "", estado_documentos: "" };
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const handleResetFilters = () => setFilters(INITIAL_FILTERS);
  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [filters]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placaParaEliminar, setPlacaParaEliminar] = useState<string | null>(null);

  const cargarAlertas = useCallback(async () => {
    try {
      const todas = await getUnidades({});
      setVencidos(todas.filter((u: Unidad) => u.estado === 'vencido').map((u: Unidad) => ({
        id_documento: u.id_unidad,
        nombre_documento: u.documento_critico || "SOAT / Inspección",
        entityId: u.placa,
        entityName: `Placa: ${u.placa}`
      })));
      setPorVencer(todas.filter((u: Unidad) => u.estado === 'por_vencer').map((u: Unidad) => ({
        id_documento: u.id_unidad,
        nombre_documento: u.documento_critico || "RUAT",
        entityId: u.placa,
        entityName: `Placa: ${u.placa}`,
        dias_restantes: u.dias_restantes ?? null
      })));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarTabla = useCallback(async () => {
    try {
      setLoading(true);
      const resUnidades = await getUnidades(filters);
      setUnidades(resUnidades);
    } catch (err) {
      console.error(err);
      toast.error("Error operacional al sincronizar la unidad.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const syncPageData = useCallback(async () => {
    await Promise.all([cargarTabla(), cargarAlertas()]);
  }, [cargarTabla, cargarAlertas]);

  // Carga inicial: tabla + alertas + categorías
  useEffect(() => {
    cargarAlertas();
    getCategoriasEntidad()
      .then(data => {
        if (Array.isArray(data)) {
          const filtradas = data.filter((c: any) =>
            ['TRACTO', 'SEMIREMOLQUE', 'REMOLQUE'].includes(c.tipo_categoria)
          );
          setCategorias(filtradas);
        } else {
          console.error("Estructura de respuesta no válida para categorías:", data);
          setCategorias([]);
        }
      })
      .catch(err => {
        console.error("Error cargando el catálogo de categorías:", err);
        setCategorias([]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarga solo la tabla cuando cambian los filtros
  useEffect(() => {
    cargarTabla();
  }, [cargarTabla]);

const handleFormSubmitUnificado = async (
  payloadUnidad: any,
  archivos: Record<number, File>,
  fechas: Record<number, string>,
  fotosFlota: File[],
  fotosEliminar: number[] = []
) => {
  try {
    if (selectedUnidad) {
      // ACTUALIZAR: unidad ya existe, transacción manejada en el backend
      const { placa: _omitir, ...datosParaActualizar } = payloadUnidad;
      const formData = new FormData();
      Object.keys(datosParaActualizar).forEach(key => {
        const valor = datosParaActualizar[key];
        if (valor !== undefined && valor !== null) formData.append(key, valor.toString());
      });
      fotosFlota.forEach(file => formData.append("fotos", file));
      if (fotosEliminar.length > 0) formData.append("fotos_eliminar", fotosEliminar.join(','));
      await updateUnidad(selectedUnidad.placa, formData);

      const todosIdsRequisitos = Array.from(new Set([
        ...Object.keys(archivos).map(Number),
        ...Object.keys(fechas).map(Number),
      ]));
      for (const idReq of todosIdsRequisitos) {
        const fileObj = archivos[idReq];
        const fechaVenc = fechas[idReq];
        if (!fileObj && !fechaVenc) continue;
        const form = new FormData();
        form.append("id_requisito", idReq.toString());
        form.append("id_unidad", selectedUnidad.id_unidad.toString());
        if (fileObj) form.append("file", fileObj);
        if (fechaVenc) {
          const date = new Date(fechaVenc);
          const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/La_Paz",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const parts = formatter.formatToParts(date);
          const year = parts.find((p) => p.type === "year")?.value ?? "2024";
          const month = parts.find((p) => p.type === "month")?.value ?? "01";
          const day = parts.find((p) => p.type === "day")?.value ?? "01";
          form.append("fecha_vencimiento", `${year}-${month}-${day}`);
        }
        await uploadDocumentoUnidad(form);
      }

    } else {
      // CREAR: un solo endpoint con transacción real en el backend
      const formData = new FormData();
      Object.keys(payloadUnidad).forEach(key => {
        const valor = payloadUnidad[key];
        if (valor !== undefined && valor !== null) formData.append(key, valor.toString());
      });
      fotosFlota.forEach(file => formData.append("fotos", file));
      Object.entries(archivos).forEach(([idRequisito, file]) => {
        formData.append(`archivo_${idRequisito}`, file);
      });
      Object.entries(fechas).forEach(([idRequisito, fecha]) => {
        formData.append(`fecha_${idRequisito}`, fecha);
      });
      await registrarUnidad(formData);
    }

    toast.success("Operación Exitosa", {
      description: selectedUnidad
        ? "Los datos de la unidad se actualizaron correctamente."
        : "Unidad registrada con éxito.",
    });
    setView('list');
    syncPageData();

  } catch (error: any) {
    toast.error("Fallo de Persistencia", { description: error.message });
  }
};

  const handleOpenDeleteConfirmation = (placa: string) => {
    setPlacaParaEliminar(placa);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (placaParaEliminar) {
      try {
        await deleteUnidad(placaParaEliminar);
        toast.success("Unidad Eliminada", { description: "La unidad ha sido eliminada" });
        syncPageData();
      } catch (e) {
        toast.error("No se pudo eliminar la unidad.");
      } finally {
        setShowDeleteModal(false);
        setPlacaParaEliminar(null);
      }
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(unidades.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = unidades.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader 
        title={view === 'list' ? "Gestión de Unidades de Carga" : selectedUnidad ? (isReadOnly ? "Detalles de la Unidad" : "Editar Ficha de Unidad") : "Registrar Nueva Unidad"}
        subtitle={view === 'list' ? "Controle el estado operativo y vigencia técnica de tractos y remolques" : "Ingrese los datos mecánicos estructurales de la flota"}
        searchPlaceholder="Buscar unidad por placa..."
        onSearch={view === 'list' ? (val) => setFilters({ ...filters, placa: val }) : undefined}
        searchValue={view === 'list' ? filters.placa : undefined}
        buttonLabel={view === 'list' ? "Nueva Unidad" : undefined}
        onButtonClick={() => { setSelectedUnidad(null); setIsReadOnly(false); setView('form'); }}
      />

      {view === 'list' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <StatCard label="Total Unidades en Flota" value={unidades.length} icon={<Truck size={24} />} borderColor="border-border" iconBg="bg-orange-50" iconColor="text-[var(--yuriana-base-orange)]" />
            <StatCard label="Disponibles" value={unidades.filter(u => u.estado_unidad === EstadoUnidad.DISPONIBLE).length} icon={<CheckCircle size={24} />} borderColor="border-[var(--yuriana-base-green)]" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard label="En Mantenimiento Taller" value={unidades.filter(u => u.estado_unidad === EstadoUnidad.MANTENIMIENTO).length} icon={<AlertTriangle size={24} />} borderColor="border-[var(--yuriana-base-red)]" iconBg="bg-red-50" iconColor="text-[var(--yuriana-input-error)]" />
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-border min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-700 uppercase text-sm tracking-tighter px-2">Listado Operacional de Transporte</h2>
              <div className="flex items-center gap-3">
                <FilterSelect placeholder="Tipo de Unidad" value={filters.id_categoria} options={categorias.map(c => ({ value: c.id_categoria.toString(), label: c.tipo_categoria }))} onChange={(v) => setFilters({ ...filters, id_categoria: v })} />
                <FilterSelect placeholder="Documentación" value={filters.estado_documentos} options={[{ value: "vencido", label: "Vencidos" }, { value: "por_vencer", label: "Por Vencer" }, { value: "vigente", label: "Vigentes" }]} onChange={(v) => setFilters({ ...filters, estado_documentos: v })} />
                <FilterSelect placeholder="Estado" value={filters.estado_unidad} options={[{ value: "DISPONIBLE", label: "Disponibles" }, { value: "EN_VIAJE", label: "En Viaje" }, { value: "ASIGNADO", label: "Asignados" }, { value: "MANTENIMIENTO", label: "En Mantenimiento" }]} onChange={(v) => setFilters({ ...filters, estado_unidad: v })} />
                <ResetFiltersButton onClick={handleResetFilters} />
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center text-gray-400 italic text-sm">Consultando estado de la flota vehicular...</div>
            ) : (
              <UnidadTable
                data={registrosPagina}
                onDelete={handleOpenDeleteConfirmation}
                onEdit={(u) => { setSelectedUnidad(u); setIsReadOnly(false); setView('form'); }}
                onView={(u) => { setSelectedUnidad(u); setIsReadOnly(true); setView('form'); }}
              />
            )}
            <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={unidades.length} registrosMostrados={registrosPagina.length} onPageChange={setPagina} />
          </div>

          <ModuleAlertsPanel vencidos={vencidos} porVencer={porVencer} entityType="unidad" onAction={(placa) => setFilters({ ...filters, placa })} />
        </div>
      ) : (
        <UnidadForm initialData={selectedUnidad} categoriasValidadas={categorias} isReadOnly={isReadOnly} onSubmit={handleFormSubmitUnificado} onCancel={() => setView('list')} />
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN PREMIUM */}
  {showDeleteModal && (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300 mx-4">
        
        {/* Contenedor del Icono de Alerta Estilizado */}
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100/60 shadow-inner">
          <XCircle size={32} className="animate-pulse" />
        </div>

        {/* Textos Informativos Administrativos */}
        <div className="space-y-2">
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">
            ¿Eliminar esta Unidad?
          </h3>
          
        </div>

        {/* Botonería Corporativa */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            type="button" 
            onClick={() => { setShowDeleteModal(false); setPlacaParaEliminar(null); }} 
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