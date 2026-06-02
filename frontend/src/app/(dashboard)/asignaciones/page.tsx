"use client";
import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { FilterSelect } from "@/components/atoms/FilterSelect";
import { AsignacionTable } from "@/components/organisms/AsignacionTable";
import { AsignacionForm } from "@/components/organisms/AsignacionForm";
import { getAsignaciones, createAsignacion, desengancharUnidad } from "@/lib/api/asignacion.api";
import { Asignacion } from "@/types/asignacion.types";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function AsignacionesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [filters, setFilters] = useState({ estado_asignacion: "activo", ci_conductor: "", placa_tracto: "", placa_remolque: "" });
  
  // Estados de control idénticos a Colaboradores
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [showDesengancheModal, setShowDesengancheModal] = useState(false);
  const [idParaDesenganchar, setIdParaDesenganchar] = useState<number | null>(null);

  const syncAsignaciones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAsignaciones(filters);
      setAsignaciones(res);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al sincronizar el mapa logístico de enganches.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    syncAsignaciones();
  }, [syncAsignaciones]);

  const handleFormSubmit = async (payload: { ci_conductor: number; placa_tracto: string; placa_remolque: string }) => {
    try {
      // Al ser un módulo operacional de enganche estático, si hay selectedAsignacion se puede procesar actualización o mantener histórico
      const response = await createAsignacion(payload);
      
      toast.success("Operación Exitosa", {
        description: "El enganche transaccional ha sido registrado con éxito en la flota.",
      });

      // Muestra de alertas preventivas documentales en cascada
      if (response.alertas && response.alertas.length > 0) {
        response.alertas.forEach((alerta: any) => {
          toast.warning("Alerta Documental Preventiva", {
            description: alerta.mensaje,
            duration: 8000
          });
        });
      }

      setView('list');
      syncAsignaciones();
    } catch (error: any) {
      console.error(error);
      toast.error("Fallo de Validación", { description: error.message || "Unidades o tripulación no disponibles." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title={view === 'list' ? "Gestión de asignaciones" : selectedAsignacion ? (isReadOnly ? "Detalles del Enganche" : "Modificar Asignación") : "Registrar Nueva Asignación"}
        subtitle={view === 'list' ? "Controle el acoplamiento y emparejamiento de transportes de carga" : "Vincule la tripulación con las unidades de arrastre autorizadas"}
        searchPlaceholder="Buscar por CI de conductor"
        onSearch={(value) => setFilters(prev => ({ ...prev, ci_conductor: value.trim() }))}
        buttonLabel={view === 'list' ? "Nueva Asignación" : undefined}
        onButtonClick={() => {
          setSelectedAsignacion(null);
          setIsReadOnly(false);
          setView('form');
        }}
      />

      {view === 'list' ? (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-border min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-700 uppercase text-sm tracking-tighter px-2">Listado de Asignaciones</h2>
            <div className="flex gap-4">
              <FilterSelect 
                placeholder="Estado" 
                options={[{ value: "activo", label: "Activos" }, { value: "asignado", label: "Asignados" }]} 
                onChange={(v) => setFilters({ ...filters, estado_asignacion: v })} 
              />
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-gray-400 italic text-sm font-medium">Consultando base de datos logísticos...</div>
          ) : (
            <AsignacionTable 
              data={asignaciones} 
              onView={(asig) => { setSelectedAsignacion(asig); setIsReadOnly(true); setView('form'); }} 
              onEdit={(asig) => { setSelectedAsignacion(asig); setIsReadOnly(false); setView('form'); }}
              onDelete={(id) => { setIdParaDesenganchar(id); setShowDesengancheModal(true); }}
            />
          )}
        </div>
      ) : (
        <AsignacionForm 
          initialData={selectedAsignacion} 
          isReadOnly={isReadOnly} 
          onSubmit={handleFormSubmit} 
          onCancel={() => setView('list')} 
        />
      )}

      {/* MODAL CON IDENTIDAD CORPORATIVA VIVA */}
      {showDesengancheModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[var(--yuriana-base-orange)] shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300 mx-4">
            <div className="w-16 h-16 bg-orange-50 text-[var(--yuriana-base-orange)] rounded-2xl flex items-center justify-center mx-auto border border-orange-100 shadow-inner">
              <AlertCircle size={32} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">¿Efectuar Desenganche?</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[320px] mx-auto">
                Al disolver este acoplamiento operativo, las unidades y el conductor cambiarán de forma inmediata al estado <span className="text-emerald-600 font-bold uppercase">Disponible</span>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button" onClick={() => { setShowDesengancheModal(false); setIdParaDesenganchar(null); }} className="w-full py-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                Mantener Vinculados
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  if (idParaDesenganchar) {
                    try {
                      await desengancharUnidad(idParaDesenganchar);
                      toast.success("Desenganche completado correctamente.");
                      syncAsignaciones();
                    } catch { 
                      toast.error("Error al procesar el desenganche."); 
                    } finally { 
                      setShowDesengancheModal(false); 
                      setIdParaDesenganchar(null); 
                    }
                  }
                }} 
                className="w-full py-3.5 bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] hover:bg-amber-500 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Confirmar Desenganche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}