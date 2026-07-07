"use client";

import { useEffect, useState, useCallback } from "react";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { ColaboradorTable } from "@/components/organisms/ColaboradorTable";
import { ColaboradorForm } from "@/components/organisms/ColaboradorForm";
import { FilterSelect } from "@/components/atoms/FilterSelect";
import {
  getColaboradores,
  deleteColaborador,
  createColaborador,
  updateColaborador
} from "@/lib/api/colaborador.api";
import { Colaborador, TipoColaborador } from "@/types/colaborador.types";
import { TablePagination } from "@/components/molecules/TablePagination";

const PAGE_SIZE = 10;
const INITIAL_FILTERS = { nombre: "", ciudad: "", tipo_colaborador: "" };

export default function ColaboradoresPage() {
  // --- ESTADOS ---
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<Colaborador[]>([]);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pagina, setPagina] = useState(1);
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  // Carga ciudades únicas una vez al montar
  useEffect(() => {
    getColaboradores({} as any)
      .then((all: Colaborador[]) => {
        const unicas = Array.from(
          new Set(all.map((c) => c.persona.ciudad).filter(Boolean))
        ).sort() as string[];
        setCiudadesDisponibles(unicas);
      })
      .catch(() => {});
  }, []);

  // --- CARGA DE DATOS ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getColaboradores(filters as any);
      setData(res);
      setPagina(1);
    } catch {
      toast.error("Error al cargar los colaboradores");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- MANEJADORES ---
  const handleDelete = async (id: number) => {
    try {
      await deleteColaborador(id);
      toast.success("Colaborador eliminado correctamente");
      loadData();
    } catch (error: any) {
      toast.error("No se pudo eliminar el colaborador", { description: error.message });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedColab) {
        await updateColaborador(selectedColab.id_colaborador, formData);
        toast.success("Colaborador actualizado", { description: "Los datos se guardaron correctamente." });
      } else {
        await createColaborador(formData);
        toast.success("Colaborador registrado", { description: "El colaborador fue creado exitosamente." });
      }
      setView('list');
      loadData();
    } catch (error: any) {
      toast.error("Error al guardar", { description: error.message || "Verifica los datos e intenta de nuevo." });
    }
  };

  const handleOpenCreate = () => {
    setSelectedColab(null);
    setIsReadOnly(false);
    setView('form');
  };

  const handleOpenEdit = (colab: Colaborador) => {
    setSelectedColab(colab);
    setIsReadOnly(false);
    setView('form');
  };

  const handleOpenView = (colab: Colaborador) => {
    setSelectedColab(colab);
    setIsReadOnly(true);
    setView('form');
  };

  const totalPaginas = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = data.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={view === 'list' ? "Gestión de Colaboradores" : selectedColab ? (isReadOnly ? "Datos del Colaborador" : "Editar Colaborador") : "Registrar Nuevo Colaborador"}
        subtitle={view === 'list' ? "Gestione a los colaboradores de la empresa" : undefined}
        onSearch={view === 'list' ? (v) => setFilters(prev => ({ ...prev, nombre: v })) : undefined}
        searchValue={view === 'list' ? filters.nombre : undefined}
        searchPlaceholder="Buscar por nombre"
        buttonLabel={view === 'list' ? "Nuevo Colaborador" : undefined}
        onButtonClick={handleOpenCreate}
      />

      {view === 'list' ? (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-700 uppercase tracking-tighter">Listado de Colaboradores</h2>
            <div className="flex items-center gap-3">
               <FilterSelect
                 placeholder="Ciudad"
                 value={filters.ciudad}
                 options={ciudadesDisponibles.map((c) => ({ value: c, label: c }))}
                 onChange={(v) => setFilters(prev => ({ ...prev, ciudad: v }))}
               />
               <FilterSelect
                 placeholder="Tipo"
                 value={filters.tipo_colaborador}
                 options={[
                   {value: TipoColaborador.ATA, label: "ATA"},
                   {value: TipoColaborador.DESPACHANTE, label: "Despachante"}
                 ]}
                 onChange={(v) => setFilters(prev => ({ ...prev, tipo_colaborador: v as any }))}
               />
               <ResetFiltersButton onClick={handleResetFilters} />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400 italic">Cargando colaboradores...</div>
          ) : (
            <ColaboradorTable
              data={registrosPagina}
              onDelete={handleDelete}
              onEdit={handleOpenEdit}
              onView={handleOpenView}
            />
          )}
          <TablePagination
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            totalRegistros={data.length}
            registrosMostrados={registrosPagina.length}
            onPageChange={setPagina}
          />
        </div>
      ) : (
        <ColaboradorForm
          initialData={selectedColab}
          isReadOnly={isReadOnly}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
}
