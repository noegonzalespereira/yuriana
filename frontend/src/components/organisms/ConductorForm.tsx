"use client";
import { useForm } from "react-hook-form";
import { Conductor, EstadoLaboral, EstadoOperativo } from "@/types/conductor.types";
import { RequisitoDocumento } from "@/types/documento.types";
import { getRequisitos, getCategorias } from "@/lib/api/requisito.api";
import { TipoCategoria } from "@/types/documento.types";
import { getDocumentosDeEntidad } from "@/lib/api/conductor.api";
import { Info, FileText, Upload, Loader2, RefreshCw, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { ModuleField } from "../molecules/ModuleField";
import { FormActions } from "../atoms/FormActions";
import { toast } from "sonner";

interface Props {
  initialData?: Conductor | null;
  onSubmit: (datosConductor: any, archivos: Record<number, File>, fechas: Record<number, string>) => Promise<void>;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export const ConductorForm = ({ initialData, onSubmit, onCancel, isReadOnly }: Props) => {
  const { register, handleSubmit, reset, setValue, trigger, formState: { errors } } = useForm({
    mode: "onChange",
  });
  
  const [requisitos, setRequisitos] = useState<RequisitoDocumento[]>([]);
  const [documentosGuardados, setDocumentosGuardados] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<Record<number, File>>({});

  useEffect(() => {
    const fetchMatrizRequisitos = async () => {
      try {
        setLoadingReqs(true);
        const categorias = await getCategorias();
        const catConductor = categorias.find(c => c.tipo_categoria === TipoCategoria.CONDUCTOR);
        const reqsData = catConductor
          ? await getRequisitos({ id_categoria: catConductor.id_categoria })
          : [];
        setRequisitos(reqsData);

        if (initialData?.id_conductor) {
          const docsData = await getDocumentosDeEntidad(initialData.id_conductor);
          setDocumentosGuardados(docsData);
          
          docsData.forEach(doc => {
            if (doc.fecha_vencimiento) {
              const date = new Date(doc.fecha_vencimiento);
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
              setValue(`fecha_req_${doc.id_requisito}`, `${year}-${month}-${day}`);
            }
          });
        }
      } catch (err) {
        console.error("Error sincronizando requisitos:", err);
      } finally {
        setLoadingReqs(false);
      }
    };
    fetchMatrizRequisitos();
  }, [initialData, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData.persona,
        sueldo: initialData.sueldo,
        estado_operativo: initialData.estado_operativo,
        estado_laboral: initialData.estado_laboral,
      });
    } else {
      reset({ ci: "", nombre: "", correo: "", ciudad: "", telefono: "", sueldo: "", estado_operativo: EstadoOperativo.DISPONIBLE, estado_laboral: EstadoLaboral.ACTIVO });
    }
  }, [initialData, reset]);

  const handleSeleccionarArchivoLocal = (idRequisito: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error("Formato no soportado", {
        description: "Solo se permiten archivos PDF, JPG o PNG."
      });
      return;
    }

    setArchivosSeleccionados(prev => ({ ...prev, [idRequisito]: file }));
  };

  const handleAbrirDocumento = async (idDocumento: number, url: string) => {
  if (!url) return;

  const esPDF = url.toUpperCase().includes('.pdf');
  if (!esPDF) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const toastId = toast.loading("Preparando documento...");

  try {
    const token = localStorage.getItem('yuriana_token');
    if (!token) {
      toast.dismiss(toastId);
      toast.error("Sesión expirada");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    
    const response = await fetch(`${baseUrl}/documento/ver/${idDocumento}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);

    const data = await response.json();
    // data = { url: "https://res.cloudinary.com/...?signature=..." }

    toast.dismiss(toastId);
    
    // Abre la URL firmada directamente — Chrome maneja el PDF nativo
    window.open(data.url, '_blank', 'noopener,noreferrer');

  } catch (error) {
    toast.dismiss(toastId);
    toast.error("Error al abrir documento", {
      description: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};

  const handleValidationAndSubmit = async (data: any) => {
    // Validación cruzada: conductor inactivo no puede estar en viaje ni asignado
    if (
      data.estado_laboral === EstadoLaboral.INACTIVO &&
      (initialData?.estado_operativo === EstadoOperativo.VIAJE || initialData?.estado_operativo === EstadoOperativo.ASIGNADO)
    ) {
      toast.error("Estado inconsistente", {
        description: "No se puede marcar como inactivo a un conductor que está en viaje o asignado.",
      });
      return;
    }

    // 1. VALIDACIÓN DINÁMICA DE EXPEDIENTES (ALTA Y EDICIÓN)
    for (const req of requisitos) {
      const archivoLocal = archivosSeleccionados[req.id_requisito_documento];
      const docGuardado = documentosGuardados.find(d => d.id_requisito === req.id_requisito_documento);
      const fechaValor = data[`fecha_req_${req.id_requisito_documento}`];

      if (req.es_obligatorio) {
        // Si no se encuentra en Cloudinary ni preparado en memoria
        if (!docGuardado && !archivoLocal) {
          toast.error("Expediente Incompleto", {
            description: `El documento "${req.nombre_documento}" es obligatorio para registrar al conductor.`,
          });
          return;
        }

        // Si requiere fecha y no se ha especificado
        if (req.requiere_vencimiento && !fechaValor && (archivoLocal || docGuardado)) {
          toast.error("Fecha Obligatoria", {
            description: `Debe ingresar la fecha de vencimiento para "${req.nombre_documento}".`,
          });
          return;
        }
      }
    }

    // 2. Extraer fechas dinámicas remanentes
    const fechasEnvio: Record<number, string> = {};
    requisitos.forEach((req) => {
      const fechaValor = data[`fecha_req_${req.id_requisito_documento}`];
      if (fechaValor) {
        fechasEnvio[req.id_requisito_documento] = fechaValor;
      }
    });

    // 3. Empaquetar DTO limpio libre de propiedades fantasmas
    const payloadConductor = {
      nombre: data.nombre?.trim().toUpperCase(),
      correo: data.correo,
      ciudad: data.ciudad?.trim().toUpperCase() || undefined,
      telefono: data.telefono ? parseInt(data.telefono) : 0,
      telefono2: data.telefono2 ? parseInt(data.telefono2) : undefined,
      sueldo: data.sueldo ? parseFloat(data.sueldo) : undefined,
      estado_operativo: data.estado_operativo,
      estado_laboral: data.estado_laboral,
      ci: data.ci?.trim() || "",
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payloadConductor, archivosSeleccionados, fechasEnvio);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el conductor";
      toast.error("Error al guardar", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleValidationAndSubmit)} className="space-y-6 text-left">
      {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-border pb-4">
          <Info size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Información General</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField
            label="CI *"
            name="ci"
            type="text"
            inputMode="numeric"
            register={register}
            disabled={isReadOnly}
            error={errors.ci}
            rules={{
              required: "El CI es obligatorio",
              validate: (value: string) => {
                if (!/^\d+$/.test(value)) return "El CI solo debe contener números";
                if (value.length < 5) return "El CI debe tener al menos 5 dígitos";
                return true;
              },
            }}
          />
          <ModuleField label="Nombre" name="nombre" register={register} disabled={isReadOnly} error={errors.nombre} rules={{ required: "El nombre es obligatorio" }} />
          <ModuleField label="Correo *" name="correo" type="email" register={register} disabled={isReadOnly} error={errors.correo} rules={{ required: "El correo es obligatorio" }} />
          <ModuleField label="Ciudad" name="ciudad" register={register} disabled={isReadOnly} />
          <ModuleField label="Teléfono" name="telefono" type="number" register={register} disabled={isReadOnly} error={errors.telefono} rules={{ required: "El teléfono es obligatorio", validate: (v: string) => !v || /^\d{8,15}$/.test(v) || "El teléfono debe tener entre 8 y 15 dígitos " }} />
          <ModuleField label="Sueldo (Bs)" name="sueldo" type="number" register={register} disabled={isReadOnly} error={errors.sueldo} rules={{ min: { value: 0, message: "El sueldo no puede ser negativo" } }} />

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1 flex items-center gap-1">
              Estado Operativo <span className="text-red-500">*</span>
            </label>
            {initialData && (initialData.estado_operativo === EstadoOperativo.VIAJE || initialData.estado_operativo === EstadoOperativo.ASIGNADO) ? (
              <div className="w-full bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium text-slate-500">
                {initialData.estado_operativo === EstadoOperativo.VIAJE ? "En Viaje" : "Asignado"}
                <span className="ml-2 text-[10px] text-slate-400 font-bold">(automático)</span>
              </div>
            ) : (
              <select {...register("estado_operativo")} disabled={isReadOnly} className="w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium outline-none">
                <option value={EstadoOperativo.DISPONIBLE}>Disponible</option>
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1 flex items-center gap-1">
              Estado Laboral <span className="text-red-500">*</span>
            </label>
            <select {...register("estado_laboral")} disabled={isReadOnly} className="w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium outline-none">
              <option value={EstadoLaboral.ACTIVO}>Activo</option>
              <option value={EstadoLaboral.INACTIVO}>Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DOCUMENTOS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-border pb-4">
          <FileText size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Documentación Requerida</h3>
        </div>

        {loadingReqs ? (
          <div className="text-center py-12 text-sm italic text-gray-400">Consultando requisitos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requisitos.map((req) => {
              const docGuardado = documentosGuardados.find(d => d.id_requisito === req.id_requisito_documento);
              const archivoLocal = archivosSeleccionados[req.id_requisito_documento];
              
              return (
                <div key={req.id_requisito_documento} className="border border-border p-4 rounded-2xl flex flex-col gap-3 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <div className="p-2 bg-slate-50 text-gray-500 rounded-xl border border-slate-100 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-gray-800 text-sm truncate">
                          {req.nombre_documento} {req.es_obligatorio && <span className="text-red-500">*</span>}
                        </span>
                        <span className={`text-[9px] font-black uppercase ${
                          archivoLocal ? "text-blue-500" : docGuardado ? "text-emerald-600" : "text-amber-500"
                        }`}>
                          {archivoLocal ? `✓ Preparado: ${archivoLocal.name.substring(0, 12)}...` : docGuardado ? "✓ Almacenado" : "⚠ Sin archivo"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {docGuardado && (
                        <button 
                          type="button" 
                          onClick={() => handleAbrirDocumento(docGuardado.id_documento, docGuardado.url_documento)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Eye size={12} /> Ver
                        </button>
                      )}

                      {!isReadOnly && (
                        <label className={`px-3 py-1.5 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer transition-all ${
                          docGuardado ? "bg-amber-500 hover:bg-amber-600" : "bg-[var(--yuriana-base-orange)]"
                        }`}>
                          {docGuardado ? <RefreshCw size={12} /> : <Upload size={12} />}
                          <span>{docGuardado ? "Reemplazar" : "Subir"}</span>
                          <input 
                            type="file" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            onChange={(e) => handleSeleccionarArchivoLocal(req.id_requisito_documento, e)} 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter ml-1">
                      {req.requiere_vencimiento ? "Fecha de vencimiento" : "Este documento no vence"}
                    </span>
                    <input 
                      type="date" 
                      disabled={isReadOnly || !req.requiere_vencimiento}
                      {...register(`fecha_req_${req.id_requisito_documento}`)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold outline-none focus:border-[var(--yuriana-base-orange)] text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACCIONES */}
      <FormActions
        onCancel={onCancel}
        isReadOnly={isReadOnly}
        isSubmitting={isSubmitting}
        isEditing={!!initialData}
        entityLabel="Conductor"
      />
    </form>
  );
};