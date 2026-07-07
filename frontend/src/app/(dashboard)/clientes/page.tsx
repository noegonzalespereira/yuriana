"use client";
import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { ClienteTable } from "@/components/organisms/ClienteTable";
import { ClienteForm } from "@/components/organisms/ClienteForm";
import { getClientes, deleteCliente, createCliente, updateCliente } from "@/lib/api/cliente.api";
import { Cliente } from "@/types/cliente.types";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { TablePagination } from "@/components/molecules/TablePagination";

const PAGE_SIZE = 10;

export default function ClientesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<Cliente[]>([]);
  const INITIAL_FILTERS = { buscar: "" };
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const handleResetFilters = () => setFilters(INITIAL_FILTERS);
  const [pagina, setPagina] = useState(1);
  useEffect(() => { setPagina(1); }, [filters]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─── Modal de confirmación de eliminación ───────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codigoParaEliminar, setCodigoParaEliminar] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getClientes(filters);
      setData(res);
    } catch (error) {
      console.error("ERROR CARGANDO CLIENTES:", error);
      toast.error("ERROR AL CARGAR", {
        description: "NO SE PUDO OBTENER LISTA DE CLIENTES"
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  // Abre el modal en lugar de confirm()
  const handleOpenDeleteConfirmation = (codigo: string) => {
    setCodigoParaEliminar(codigo);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!codigoParaEliminar) return;
    try {
      await deleteCliente(codigoParaEliminar);
      toast.success("CLIENTE ELIMINADO", {
        description: `El CLIENTE FUE ELIMINADO CORRECTAMENTE.`
      });
      loadData();
    } catch (error: any) {
      toast.error("ERROR AL ELIMINAR", {
        description: error.message || "NO SE PUDO ELIMINAR EL CLIENTE"
      });
    } finally {
      setShowDeleteModal(false);
      setCodigoParaEliminar(null);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedCliente) {
        await updateCliente(selectedCliente.codigo_cliente, formData);
        toast.success("CLIENTE ACTUALIZADO", {
          description: "LOS DATOS DEL CLIENTE FUERON ACTUALIZADOS CORRECTAMENTE."
        });
      } else {
        await createCliente(formData);
        toast.success("CLIENTE REGISTRADOS", {
          description: "EL NUEVO CLIENTE FUE REGISTRADO CON EXITO"
        });
      }
      setView('list');
      loadData();
    } catch (error: any) {
      console.error("ERROR EN EL SERVIDOR (CLIENTES):", error);
      toast.error("ERROR AL GUARDAR", {
        description: error.message || "VERIFIQUE LOS DATOS E INTENTE DE NUEVO."
      });
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = data.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={view === 'list' ? "Gestión de Clientes" : selectedCliente ? (isReadOnly ? "Datos de la Empresa" : "Editar Datos de Cliente") : "Registrar Nuevo Cliente"}
        subtitle={view === 'list' ? "Gestione los clientes de la empresa" : undefined}
        searchPlaceholder="Buscar por cliente y código"
        onSearch={view === 'list' ? (val) => setFilters({ buscar: val }) : undefined}
        searchValue={view === 'list' ? filters.buscar : undefined}
        buttonLabel={view === 'list' ? "Nuevo Cliente" : undefined}
        onButtonClick={() => { setSelectedCliente(null); setIsReadOnly(false); setView('form'); }}
      />

      {view === 'list' ? (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6 px-4">
            <h2 className="font-bold text-gray-700 uppercase tracking-tighter text-sm">Listado de Clientes</h2>
            <div className="flex items-center gap-3">
              <ResetFiltersButton onClick={handleResetFilters} />
            </div>
          </div>
          {loading ? (
            <div className="py-20 text-center text-gray-400 italic text-sm font-medium uppercase">Cargando datos...</div>
          ) : (
            <ClienteTable
              data={registrosPagina}
              onDelete={handleOpenDeleteConfirmation}
              onEdit={(c) => { setSelectedCliente(c); setIsReadOnly(false); setView('form'); }}
              onView={(c) => { setSelectedCliente(c); setIsReadOnly(true); setView('form'); }}
            />
          )}
          <TablePagination pagina={paginaActual} totalPaginas={totalPaginas} totalRegistros={data.length} registrosMostrados={registrosPagina.length} onPageChange={setPagina} />
        </div>
      ) : (
        <ClienteForm
          initialData={selectedCliente}
          isReadOnly={isReadOnly}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('list')}
        />
      )}

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-[var(--yuriana-input-error)] rounded-full flex items-center justify-center mx-auto border border-red-100">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tighter text-base">¿Eliminar Cliente?</h3>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowDeleteModal(false); setCodigoParaEliminar(null); }}
                className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors ">
                Cancelar
              </button>
              <button type="button" onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-[var(--yuriana-input-error)] text-white rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-colors shadow-md">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}