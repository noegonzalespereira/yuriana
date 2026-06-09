"use client";

import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { ColaboradorTable } from "@/components/organisms/ColaboradorTable";
import { ColaboradorForm } from "@/components/organisms/ColaboradorForm"; // Cambiado a Form
import { FilterSelect } from "@/components/atoms/FilterSelect";
import { 
  getColaboradores, 
  deleteColaborador, 
  createColaborador, 
  updateColaborador 
} from "@/lib/api/colaborador.api";
import { Colaborador, TipoColaborador } from "@/types/colaborador.types";

export default function ColaboradoresPage() {
  // --- ESTADOS ---
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<Colaborador[]>([]);
  const [filters, setFilters] = useState({ nombre: "", ciudad: "", tipo_colaborador: "" });
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getColaboradores(filters as any);
      setData(res);
    } catch (error) {
      console.error("Error cargando colaboradores:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- MANEJADORES ---
  const handleDelete = async (ci: number) => {
    if (confirm("¿Estás seguro de eliminar este colaborador?")) {
      await deleteColaborador(ci);
      loadData();
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedColab) {
        // En tu backend usas el CI para actualizar
        await updateColaborador(selectedColab.persona.ci, formData);
      } else {
        await createColaborador(formData);
      }
      setView('list'); // Volver a la tabla
      loadData();
    } catch (error: any) {
      console.error("Error en el servidor:", error);
      alert("Error al procesar la solicitud");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Encabezado dinámico según la vista */}
      <ModuleHeader 
        title={view === 'list' ? "Gestión de Colaboradores" : selectedColab ? (isReadOnly ? "Datos del Colaborador" : "Editar Colaborador") : "Registrar Nuevo Colaborador"}
        subtitle={view === 'list' ? "Gestione a los colaboradores de la empresa" : undefined}
        onSearch={view === 'list' ? (v) => setFilters({...filters, nombre: v}) : undefined}
        buttonLabel={view === 'list' ? "Nuevo Colaborador" : undefined}
        onButtonClick={handleOpenCreate}
      />

      {view === 'list' ? (
        /* VISTA DE TABLA */
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-700 uppercase tracking-tighter">Listado de Colaboradores</h2>
            <div className="flex gap-4">
               <FilterSelect 
                 placeholder="Ciudad" 
                 options={[
                   {value:"Sucre", label:"Sucre"}, 
                   {value:"Oruro", label:"Oruro"},
                   {value:"Potosi", label:"Potosí"},
                   {value:"Santa Cruz", label:"Santa Cruz"}
                 ]} 
                 onChange={(v) => setFilters({...filters, ciudad: v})}
               />
               <FilterSelect 
                 placeholder="Tipo" 
                 options={[
                   {value: TipoColaborador.ATA, label: "ATA"}, 
                   {value: TipoColaborador.DESPACHANTE, label: "Despachante"}
                 ]} 
                 onChange={(v) => setFilters({...filters, tipo_colaborador: v as any})}
               />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400 italic">Cargando colaboradores...</div>
          ) : (
            <ColaboradorTable 
              data={data} 
              onDelete={handleDelete}
              onEdit={handleOpenEdit}
              onView={handleOpenView}
            />
          )}
        </div>
      ) : (
        /* VISTA DE FORMULARIO (Toda la página) */
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