"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchInput } from "@/components/atoms/SearchInput";
import { TableActions } from "@/components/atoms/TableActions";
import { TablePagination } from "@/components/molecules/TablePagination";
import {
  actualizarEmbarque,
  eliminarEmbarque,
  getEmbarques,
  type EmbarqueGestion,
} from "@/lib/api/embarque.api";

const PAGE_SIZE = 10;

const INPUT_CLASS =
  "w-full rounded-xl border border-[var(--yuriana-input-border)] bg-[var(--yuriana-input-bg)] px-3 py-2 text-xs font-bold uppercase text-[var(--yuriana-input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--yuriana-input-border-focus)]";

export default function EmbarquesPage() {
  const [data, setData] = useState<EmbarqueGestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [editando, setEditando] = useState<EmbarqueGestion | null>(null);
  const [crt, setCrt] = useState("");
  const [total, setTotal] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setData(await getEmbarques(buscar));
    } catch (error: any) {
      toast.error("No se pudieron cargar los embarques", { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [buscar]);

  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [cargar]);

  useEffect(() => {
    setPagina(1);
  }, [buscar]);

  const totalPaginas = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = data.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const abrirEdicion = (item: EmbarqueGestion) => {
    setEditando(item);
    setCrt(item.crt);
    setTotal(item.total_unidades);
  };

  const guardar = async () => {
    if (!editando) return;
    if (!crt.trim() || total < 1) return toast.error("Ingresa el CRT y un total de viajes válido");
    try {
      setGuardando(true);
      await actualizarEmbarque(editando.id_embarque, { crt: crt.trim().toUpperCase(), total_unidades: total });
      toast.success("Embarque actualizado");
      setEditando(null);
      cargar();
    } catch (error: any) {
      toast.error("Error al actualizar", { description: error.message });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = (item: EmbarqueGestion) => {
    toast.error(`¿Eliminar el CRT ${item.crt}?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            await eliminarEmbarque(item.id_embarque);
            toast.success("Embarque eliminado");
            cargar();
          } catch (error: any) {
            toast.error("No se pudo eliminar", { description: error.message });
          }
        },
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="bg-yuriana-orange text-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-black uppercase tracking-tight">Gestión de Embarques (CRT)</h1>
        <p className="text-xs opacity-90 font-medium">Corrige o elimina CRT registrados por error</p>
      </div>

      <SearchInput placeholder="Buscar por CRT..." value={buscar} onChange={setBuscar} />

      {editando && (
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase text-gray-700">Editar CRT</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 text-[10px] font-black uppercase text-gray-500">
              CRT
              <input className={INPUT_CLASS} value={crt} onChange={(e) => setCrt(e.target.value)} />
            </label>
            <label className="space-y-1 text-[10px] font-black uppercase text-gray-500">
              Total de viajes
              <input
                type="number"
                min={1}
                className={INPUT_CLASS}
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="rounded-xl bg-slate-600 px-4 py-2 text-xs font-black uppercase text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="rounded-xl bg-yuriana-yellow px-4 py-2 text-xs font-black uppercase text-black disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-border overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-yuriana-orange text-white uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="w-12 px-3 py-2.5 text-center">#</th>
              <th className="px-4 py-2.5">CRT</th>
              <th className="px-4 py-2.5 text-center">Total viajes</th>
              <th className="px-4 py-2.5 text-center">Asignados</th>
              <th className="px-4 py-2.5 text-center">Restantes</th>
              <th className="px-4 py-2.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 italic">Cargando embarques...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 italic">No hay embarques registrados.</td>
              </tr>
            ) : (
              registrosPagina.map((item, index) => (
                <tr key={item.id_embarque} className="hover:bg-slate-50/80 transition-colors">
                  <td className="w-12 px-3 py-2.5 text-center font-bold text-slate-400">
                    {(paginaActual - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-2.5 font-black text-gray-800">{item.crt}</td>
                  <td className="px-4 py-2.5 text-center">{item.total_unidades}</td>
                  <td className="px-4 py-2.5 text-center">{item.servicios_count}</td>
                  <td className="px-4 py-2.5 text-center">{item.unidades_restantes}</td>
                  <td className="px-4 py-2.5">
                    <TableActions onEdit={() => abrirEdicion(item)} onDelete={() => eliminar(item)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        pagina={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={data.length}
        registrosMostrados={registrosPagina.length}
        onPageChange={setPagina}
      />
    </div>
  );
}
