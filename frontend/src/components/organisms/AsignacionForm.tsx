"use client";
import { useState, useEffect } from "react";
import { getConductoresDisponibles, getUnidadesDisponibles } from "@/lib/api/asignacion.api";
import { Conductor } from "@/types/conductor.types";
import { Unidad } from "@/types/unidad.types";
import { Asignacion } from "@/types/asignacion.types";
import { Search, ChevronRight, ChevronLeft, Loader2, ShieldAlert, User, Truck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: Asignacion | null;
  isReadOnly?: boolean;
  onSubmit: (data: { ci_conductor: number; placa_tracto: string; placa_remolque: string }) => Promise<void>;
  onCancel: () => void;
}

export const AsignacionForm = ({ initialData, isReadOnly = false, onSubmit, onCancel }: Props) => {
  // Si viene data inicial, nos vamos directo al paso 4 (Resumen/Inspección)
  const [step, setStep] = useState<number>(initialData ? 4 : 1);
  const [loadingLists, setLoadingLists] = useState<boolean>(false);

  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filtroTexto, setFiltroTexto] = useState<string>("");
  const [subTipoRemolque, setSubTipoRemolque] = useState<string>("Remolque");

  // Almacenamiento local del flujo estructurado
  const [selectedConductor, setSelectedConductor] = useState<any>(initialData?.conductor || null);
  const [selectedTracto, setSelectedTracto] = useState<any>(initialData?.tracto || null);
  const [selectedRemolque, setSelectedRemolque] = useState<any>(initialData?.remolque || null);

  useEffect(() => {
    if (initialData) return; // No consultar disponibilidad si es inspección

    const cargarDatosFase = async () => {
      try {
        setLoadingLists(true);
        setFiltroTexto("");
        if (step === 1) {
          const res = await getConductoresDisponibles();
          setConductores(res);
        } else if (step === 2) {
          const res = await getUnidadesDisponibles(2); // Carga Tractos
          setUnidades(res.filter(u => u.estado_unidad === "disponible"));
        } else if (step === 3) {
          const res = await getUnidadesDisponibles(); // Carga Acoplados
          setUnidades(res.filter(u => u.estado_unidad === "disponible"));
        }
      } catch (err) {
        toast.error("Error sincronizando los catálogos del enganche.");
      } finally {
        setLoadingLists(false);
      }
    };
    cargarDatosFase();
  }, [step, initialData]);

  const itemsFiltrados = () => {
    const txt = filtroTexto.toLowerCase().trim();
    if (step === 1) return conductores.filter(c => c.persona.nombre.toLowerCase().includes(txt) || c.persona.ci.toString().includes(txt));
    if (step === 2) return unidades.filter(u => u.placa.toLowerCase().includes(txt));
    if (step === 3) return unidades.filter(u => u.placa.toLowerCase().includes(txt) && u.categoria?.tipo_categoria?.toLowerCase() === subTipoRemolque.toLowerCase());
    return [];
  };

  const ejecutarEnvio = () => {
    const ci = selectedConductor?.persona?.ci || selectedConductor?.ci_persona;
    if (!ci || !selectedTracto?.placa || !selectedRemolque?.placa) {
      toast.error("Formulario incompleto.");
      return;
    }
    onSubmit({
      ci_conductor: Number(ci),
      placa_tracto: selectedTracto.placa?.toUpperCase(),
      placa_remolque: selectedRemolque.placa?.toUpperCase()
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* CUERPO CENTRAL DE SELECCIÓN */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Marcador de Pasos Corporativo */}
        <div className="bg-[var(--yuriana-base-orange)] px-6 py-5 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between relative">
            {/* Línea conectora de fondo */}
            <div className="absolute left-0 right-0 top-4 h-px bg-white/25 mx-10 z-0" />

            {[
              { s: 1, label: "Conductor" },
              { s: 2, label: "Tracto" },
              { s: 3, label: "Remolque" },
              { s: 4, label: "Validación" }
            ].map((item) => (
              <div key={item.s} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  step === item.s
                    ? "bg-white text-[var(--yuriana-base-orange)] shadow-md"
                    : step > item.s
                      ? "bg-white/90 text-emerald-600"
                      : "bg-white/20 text-white/60"
                }`}>
                  {step > item.s ? "✓" : item.s}
                </div>
                <span className={`text-[9px] uppercase font-black tracking-tight transition-all ${
                  step === item.s ? "text-white" : step > item.s ? "text-white/80" : "text-white/40"
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Principal */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[var(--yuriana-base-orange)] shadow-sm min-h-[480px] flex flex-col justify-between">
          <div>
            {step < 4 && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4 mb-6">
                <h3 className="font-black text-[var(--yuriana-base-black)] text-base uppercase tracking-tight">
                  {step === 1 && "Selección de Conductor"}
                  {step === 2 && "Selección de Tracto"}
                  {step === 3 && "Selección de Remolque o Semiremolque"}
                </h3>
                <div className="relative w-full sm:max-w-xs">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar "
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5  border border-[var(--yuriana-base-orange)] rounded-xl text-xs font-semibold outline-none focus:border-[var(--yuriana-base-orange)] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex gap-2 mb-6">
                {["Remolque", "Semiremolque"].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setSubTipoRemolque(tipo)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      subTipoRemolque === tipo 
                        ? "bg-[var(--yuriana-base-orange)] text-white border-[var(--yuriana-base-orange)] shadow-sm" 
                        : "bg-white text-gray-500 border-gray-200 hover:bg-slate-50"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}

            {/* Listado dinámico */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {loadingLists ? (
                <div className="py-24 flex items-center justify-center gap-2 text-xs italic text-gray-400">
                  <Loader2 size={16} className="animate-spin text-[var(--yuriana-base-orange)]" /> Vinculando bitácoras de transporte...
                </div>
              ) : (
                <>
                  {step === 1 && itemsFiltrados().map((c: any) => (
                    <div
                      key={c.id_conductor}
                      onClick={() => !isReadOnly && setSelectedConductor(c)}
                      className={`p-4 border-2 border-l-4 rounded-2xl flex justify-between items-center transition-all cursor-pointer ${
                        selectedConductor?.id_conductor === c.id_conductor
                          ? "border-[var(--yuriana-base-orange)] border-l-[var(--yuriana-base-orange)] bg-orange-50/40 shadow-md"
                          : "border-slate-200 border-l-[var(--yuriana-base-orange)] shadow-sm hover:border-orange-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${selectedConductor?.id_conductor === c.id_conductor ? "bg-orange-100" : "bg-slate-100"}`}>
                          <User size={16} className="text-[var(--yuriana-base-orange)]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-[var(--yuriana-base-black)] uppercase text-xs tracking-tight">{c.persona?.nombre}</span>
                          <span className="text-[10px] text-slate-500 font-mono">CI: {c.persona?.ci}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Disponible
                      </div>
                    </div>
                  ))}

                  {step === 2 && itemsFiltrados().map((u: any) => (
                    <div
                      key={u.id_unidad}
                      onClick={() => !isReadOnly && setSelectedTracto(u)}
                      className={`p-4 border-2 border-l-4 rounded-2xl flex justify-between items-center transition-all cursor-pointer ${
                        selectedTracto?.id_unidad === u.id_unidad
                          ? "border-[var(--yuriana-base-orange)] border-l-[var(--yuriana-base-orange)] bg-orange-50/40 shadow-md"
                          : "border-slate-200 border-l-[var(--yuriana-base-orange)] shadow-sm hover:border-orange-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${selectedTracto?.id_unidad === u.id_unidad ? "bg-orange-100" : "bg-slate-100"}`}>
                          <Truck size={16} className="text-[var(--yuriana-base-orange)]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-[var(--yuriana-base-black)] text-xs tracking-tight">{u.placa}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{u.marca} — {u.color}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Disponible
                      </div>
                    </div>
                  ))}

                  {step === 3 && itemsFiltrados().map((u: any) => (
                    <div
                      key={u.id_unidad}
                      onClick={() => !isReadOnly && setSelectedRemolque(u)}
                      className={`p-4 border-2 border-l-4 rounded-2xl flex justify-between items-center transition-all cursor-pointer ${
                        selectedRemolque?.id_unidad === u.id_unidad
                          ? "border-[var(--yuriana-base-orange)] border-l-[var(--yuriana-base-orange)] bg-orange-50/40 shadow-md"
                          : "border-slate-200 border-l-[var(--yuriana-base-orange)] shadow-sm hover:border-orange-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${selectedRemolque?.id_unidad === u.id_unidad ? "bg-orange-100" : "bg-slate-100"}`}>
                          <Truck size={16} className="text-[var(--yuriana-base-orange)]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-[var(--yuriana-base-black)] text-xs tracking-tight">{u.placa}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{u.categoria?.tipo_categoria}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Disponible
                      </div>
                    </div>
                  ))}

                  {/* PASO 4: INSPECCIÓN DE DOCUMENTOS ALERTAS PREVENTIVAS */}
                  {step === 4 && (
                    <div className="space-y-4 animate-in fade-in zoom-in-98 text-slate-700">
                      <div className="border-b border-dashed border-slate-200 pb-3">
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                          {isReadOnly ? "Manifiesto de Acoplamiento Vigente" : "Resumen de Asignación "}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Verificación de los datos del conductor y la unidad.</p>
                      </div>

                      {/* Grid Informativo */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-[var(--yuriana-base-orange)]">
                          <span className="text-[10px] font-black uppercase text-[var(--yuriana-base-orange)] tracking-wider">Conductor</span>
                          <p className="text-xs font-black text-[var(--yuriana-base-black)] mt-1 uppercase">{selectedConductor?.persona?.nombre || selectedConductor?.nombre}</p>
                          <p className="text-[10px] font-mono text-slate-600 mt-0.5">CI: {selectedConductor?.persona?.ci || selectedConductor?.ci_persona}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-[var(--yuriana-base-orange)]">
                          <span className="text-[10px] font-black uppercase text-[var(--yuriana-base-orange)] tracking-wider">Tracto</span>
                          <p className="text-xs font-mono font-black text-[var(--yuriana-base-black)] mt-1">Placa: {selectedTracto?.placa}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5 uppercase">Marca: {selectedTracto?.marca || "Tracto"}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-[var(--yuriana-base-orange)]">
                          <span className="text-[10px] font-black uppercase text-[var(--yuriana-base-orange)] tracking-wider">Remolque Asignado</span>
                          <p className="text-xs font-mono font-black text-[var(--yuriana-base-black)] mt-1">Placa: {selectedRemolque?.placa}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5 uppercase">{selectedRemolque?.categoria?.tipo_categoria || "Acoplado"}</p>
                        </div>
                      </div>

                      {/* SECCIÓN CRÍTICA: ALERTAS DE DOCUMENTOS DE LA ASIGNACIÓN */}
                      {(() => {
                        const alertas: { tipo: 'vencido' | 'por_vencer'; nombre: string; entidad: string; entityType: 'conductor' | 'unidad'; dias?: number }[] = [];
                        if (selectedConductor?.estado === 'vencido' || selectedConductor?.estado === 'por_vencer') {
                          alertas.push({ tipo: selectedConductor.estado, nombre: selectedConductor.documento_critico || 'Licencia / Documentos Conductor', entidad: selectedConductor.persona?.nombre || 'Conductor', entityType: 'conductor', dias: selectedConductor.dias_restantes });
                        }
                        if (selectedTracto?.estado === 'vencido' || selectedTracto?.estado === 'por_vencer') {
                          alertas.push({ tipo: selectedTracto.estado, nombre: selectedTracto.documento_critico || 'SOAT / Inspección Tracto', entidad: `Placa: ${selectedTracto.placa}`, entityType: 'unidad', dias: selectedTracto.dias_restantes });
                        }
                        if (selectedRemolque?.estado === 'vencido' || selectedRemolque?.estado === 'por_vencer') {
                          alertas.push({ tipo: selectedRemolque.estado, nombre: selectedRemolque.documento_critico || 'RUAT / Documentos Remolque', entidad: `Placa: ${selectedRemolque.placa}`, entityType: 'unidad', dias: selectedRemolque.dias_restantes });
                        }
                        return (
                          <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-5 mt-4 space-y-3">
                            <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] font-black text-xs uppercase tracking-wider">
                              <ShieldAlert size={18} />
                              <span>Alertas Documentales </span>
                            </div>
                            {alertas.length === 0 ? (
                              <p className="text-xs text-emerald-600 font-semibold italic text-center py-2">
                                Sin alertas documentales detectadas en esta asignación.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {alertas.map((a, i) => (
                                  <div key={i} className={`p-3 rounded-xl border shadow-sm flex gap-3 ${a.tipo === 'vencido' ? 'bg-red-100/90 border-red-200' : 'bg-amber-100/90 border-amber-200'}`}>
                                    {a.entityType === 'conductor'
                                      ? <User size={16} className="shrink-0 mt-0.5 text-gray-500" />
                                      : <Truck size={16} className="shrink-0 mt-0.5 text-gray-500" />}
                                    <div>
                                      <span className={`text-[10px] font-black uppercase tracking-wider ${a.tipo === 'vencido' ? 'text-red-600' : 'text-amber-600'}`}>
                                        {a.tipo === 'vencido' ? 'Documento Vencido' : `Por vencer${a.dias ? ` (en ${a.dias} días)` : ''}`}
                                      </span>
                                      <p className="font-bold text-slate-800 mt-0.5">{a.nombre}</p>
                                      <p className="text-[10px] text-gray-500 mt-0.5">{a.entidad}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Botonera de Navegación Lateral Inferior */}
          <div className="flex justify-between border-t border-border pt-4 mt-6">
            <button
              type="button"
              disabled={step === 1 || !!initialData}
              onClick={() => setStep(prev => prev - 1)}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-0 border-var(--yuriana-base-orange) "
            >
              <div className="flex items-center gap-1"><ChevronLeft size={14}/> Anterior</div>
            </button>

            {step < 4 && (
              <button
                type="button"
                disabled={step === 1 ? !selectedConductor : step === 2 ? !selectedTracto : !selectedRemolque}
                onClick={() => setStep(prev => prev + 1)}
                className="px-6 py-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:bg-gray-100 disabled:text-gray-300 flex items-center gap-1"
              >
                Siguiente <ChevronRight size={14}/>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESUMEN DE ASIGNACIÓN LATERAL (DISEÑO AMARILLO Y NARANJA VIVO) */}
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[var(--yuriana-base-orange)] shadow-sm space-y-6 h-max">
        <h3 className="font-black text-slate-800 border-b pb-3 uppercase text-xs tracking-tight">Resumen de Asignación</h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Conductor</span>
            <div className={`p-3 rounded-xl text-xs font-bold border transition-all ${selectedConductor ? "bg-orange-50/40 text-slate-800 border-orange-200" : "bg-slate-50 text-gray-400 border-slate-100 italic"}`}>
              {selectedConductor ? (selectedConductor.persona?.nombre || selectedConductor.nombre) : "No asignado"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Tracto</span>
            <div className={`p-3 rounded-xl text-xs font-bold border transition-all ${selectedTracto ? "bg-orange-50/40 text-slate-800 border-orange-200 font-mono" : "bg-slate-50 text-gray-400 border-slate-100 italic"}`}>
              {selectedTracto ? selectedTracto.placa : "Pendiente a selección"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">Remolque/Semiremolque</span>
            <div className={`p-3 rounded-xl text-xs font-bold border transition-all ${selectedRemolque ? "bg-orange-50/40 text-slate-800 border-orange-200 font-mono" : "bg-slate-50 text-gray-400 border-slate-100 italic"}`}>
              {selectedRemolque ? selectedRemolque.placa : "Pendiente a selección"}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t flex flex-col gap-2">
          {!isReadOnly && (
            <button
              type="button"
              disabled={!selectedConductor || !selectedTracto || !selectedRemolque}
              onClick={ejecutarEnvio}
              className="w-full py-3 bg-[var(--yuriana-base-yellow)] hover:shadow-md text-[var(--yuriana-base-black)] rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:bg-gray-100 disabled:text-gray-300"
            >
              Guardar Cambios
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            {isReadOnly ? "Volver al Listado" : "Cancelar"}
          </button>
        </div>
      </div>

    </div>
  );
};