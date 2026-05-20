"use client";
import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { ClienteTable } from "@/components/organisms/ClienteTable";
import { ClienteForm } from "@/components/organisms/ClienteForm";
import { getClientes, deleteCliente, createCliente, updateCliente } from "@/lib/api/cliente.api";
import { Cliente } from "@/types/cliente.types";

export default function ClientesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<Cliente[]>([]);
  const [filters, setFilters] = useState({ nombre: "", codigo_cliente: "" });
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getClientes(filters);
      setData(res);
    } catch (error) {
      console.error("ERROR CARGANDO CLIENTES:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (codigo: string) => {
    if (confirm(`¿Eliminar cliente ${codigo}?`)) {
      try {
        await deleteCliente(codigo);
        loadData();
      } catch (error) {
        console.error("ERROR AL ELIMINAR CLIENTE:", error);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedCliente) {
        await updateCliente(selectedCliente.codigo_cliente, formData);
      } else {
        await createCliente(formData);
      }
      setView('list');
      loadData();
    } catch (error: any) {
      console.error("ERROR EN EL SERVIDOR (CLIENTES):", error);
      alert(`Error al procesar cliente: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader 
        title={view === 'list' ? "Gestión de Clientes" : selectedCliente ? (isReadOnly ? "Datos de la Empresa" : "Editar Parámetros de Cliente") : "Registrar Nuevo Cliente"}
        subtitle={view === 'form' ? "Complete las casillas fiscales y la información de la persona de contacto corporativo" : undefined}
        searchPlaceholder="Escriba código o empresa..."
        onSearch={view === 'list' ? (val) => setFilters({ nombre: val, codigo_cliente: val }) : undefined}
        buttonLabel={view === 'list' ? "Nuevo Cliente" : undefined}
        onButtonClick={() => { setSelectedCliente(null); setIsReadOnly(false); setView('form'); }}
      />

      {view === 'list' ? (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-border">
           <div className="flex justify-between items-center mb-6 px-4">
              <h2 className="font-bold text-gray-700 uppercase tracking-tighter text-sm">Listado de Clientes Activos</h2>
              <span className="text-xs text-[var(--yuriana-base-gray-light)] font-black uppercase">Mostrando {data.length} registros</span>
           </div>
           
           {loading ? (
             <div className="py-20 text-center text-gray-400 italic text-sm font-medium">Sincronizando cuentas con el servidor...</div>
           ) : (
             <ClienteTable 
               data={data} 
               onDelete={handleDelete}
               onEdit={(c) => { setSelectedCliente(c); setIsReadOnly(false); setView('form'); }}
               onView={(c) => { setSelectedCliente(c); setIsReadOnly(true); setView('form'); }}
             />
           )}
        </div>
      ) : (
        <ClienteForm 
          initialData={selectedCliente}
          isReadOnly={isReadOnly}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
}