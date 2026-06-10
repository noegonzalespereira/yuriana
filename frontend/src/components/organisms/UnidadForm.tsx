"use client";
import { useForm } from "react-hook-form";
import { Unidad, EstadoUnidad } from "@/types/unidad.types";
import { RequisitoDocumento } from "@/types/documento.types";
import { getRequisitos } from "@/lib/api/requisito.api";
import { getDocumentosDeUnidad } from "@/lib/api/unidad.api"; 
import { apiFetch } from "@/lib/api";
import { Info, FileText, Upload, Loader2, RefreshCw, Truck, X, Image as ImageIcon, Plus, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { ModuleField } from "../molecules/ModuleField";
import { toast } from "sonner";

interface Props {
  initialData?: Unidad | null;
  categoriasValidadas: { id_categoria: number; tipo_categoria: string }[]; 
  onSubmit: (datosUnidad: any, archivos: Record<number, File>, fechas: Record<number, string>, fotosFlota: File[], fotosEliminar: number[]) => Promise<void>;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export const UnidadForm = ({ initialData, categoriasValidadas, onSubmit, onCancel, isReadOnly }: Props) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    mode: "onChange",
  });
  
  // Observamos la categoría seleccionada dinámicamente
  const categoriaSeleccionadaId = watch("id_categoria");

  const [requisitos, setRequisitos] = useState<RequisitoDocumento[]>([]);
  const [documentosGuardados, setDocumentosGuardados] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para documentos
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<Record<number, File>>({});

  // Control de Galería Fotográfica Operativa (Hasta 10 imágenes)
  const [fotosLocales, setFotosLocales] = useState<File[]>([]);
  const [previewsLocales, setPreviewsLocales] = useState<string[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<any[]>([]);
  const [fotoExpandidaUrl, setFotoExpandidaUrl] = useState<string | null>(null);
  const [fotosParaEliminar, setFotosParaEliminar] = useState<number[]>([]);
  // Sincronización dinámica de requisitos por ID de categoría (2, 3 o 4)
  useEffect(() => {
    const fetchMatrizRequisitosDinamicos = async () => {
      if (!categoriaSeleccionadaId) {
        setRequisitos([]);
        return;
      }

      try {
        setLoadingReqs(true);
        const reqsData = await getRequisitos({ id_categoria: parseInt(categoriaSeleccionadaId) });
        setRequisitos(reqsData);

        if (initialData?.id_unidad && parseInt(categoriaSeleccionadaId) === initialData.id_categoria) {
          const docsData = await getDocumentosDeUnidad(initialData.id_unidad);
          setDocumentosGuardados(docsData);
          
          docsData.forEach(doc => {
            if (doc.fecha_vencimiento) {
              const formattedDate = new Date(doc.fecha_vencimiento).toISOString().split('T')[0];
              setValue(`fecha_req_${doc.id_requisito}`, formattedDate);
            }
          });
        } else {
          setDocumentosGuardados([]);
        }
      } catch (err) {
        console.error("Error sincronizando requisitos dinámicos:", err);
        toast.error("Error al cargar la matriz documental de la categoría vehicular.");
      } finally {
        setLoadingReqs(false);
      }
    };

    fetchMatrizRequisitosDinamicos();
  }, [categoriaSeleccionadaId, initialData, setValue]);

  // Inicialización de Ficha Técnica y Fotos Históricas
  useEffect(() => {
    if (initialData) {
      reset({
        placa: initialData.placa,
        id_categoria: initialData.id_categoria.toString(),
        num_chasis: initialData.num_chasis,
        marca: initialData.marca,
        color: initialData.color,
        anio: initialData.anio,
        modelo: initialData.modelo,
        estado_unidad: initialData.estado_unidad,
      });
      setFotosExistentes(initialData?.fotos?.filter(f => f.status !== false) || []);
    } else {
      reset({ placa: "", id_categoria: "", num_chasis: "", marca: "", color: "", anio: "", modelo: "", estado_unidad: EstadoUnidad.DISPONIBLE });
      setFotosExistentes([]);
    }
    setFotosLocales([]);
    setPreviewsLocales([]);
    setArchivosSeleccionados({});
    setFotosParaEliminar([]);
  }, [initialData, reset]);

  // Manejador Multi-Fotos de la Unidad con validación de límite
  const handleSeleccionarFotosUnidad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const archivosArray = Array.from(files);
    const totalFotosActuales = fotosLocales.length + fotosExistentes.length + archivosArray.length;

    if (totalFotosActuales > 10) {
      toast.error("Límite de imágenes superado", {
        description: "El sistema de Yuriana S.R.L. permite un máximo de 10 fotografías por unidad de transporte."
      });
      return;
    }

    const nuevasFotos: File[] = [];
    const nuevasPreviews: string[] = [];

    archivosArray.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`El archivo ${file.name} no es una imagen válida.`);
        return;
      }
      nuevasFotos.push(file);
      nuevasPreviews.push(URL.createObjectURL(file));
    });

    setFotosLocales(prev => [...prev, ...nuevasFotos]);
    setPreviewsLocales(prev => [...prev, ...nuevasPreviews]);
  };

  const handleRemoverFotoCola = (index: number) => {
    URL.revokeObjectURL(previewsLocales[index]); 
    setFotosLocales(prev => prev.filter((_, i) => i !== index));
    setPreviewsLocales(prev => prev.filter((_, i) => i !== index));
  };

  const handleSeleccionarArchivoLocal = (idRequisito: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error("Formato no soportado", { description: "Solo se permiten archivos transaccionales PDF, JPG o PNG." });
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

    const toastId = toast.loading("Preparando visor digital seguro...");
    try {
      const data = await apiFetch(`/documento/ver/${idDocumento}`);
      toast.dismiss(toastId);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Error al abrir el documento");
    }
  };

  const handleValidationAndSubmit = async (data: any) => {
    const anioVal = parseInt(data.anio);
    const currentYear = new Date().getFullYear();
    if (isNaN(anioVal) || anioVal < 1990 || anioVal > currentYear) {
      toast.error("Año inválido", {
        description: `El año debe estar entre 1990 y ${currentYear}.`,
      });
      return;
    }

    for (const req of requisitos) {
      const archivoLocal = archivosSeleccionados[req.id_requisito_documento];
      const docGuardado = documentosGuardados.find(d => d.id_requisito === req.id_requisito_documento);
      const fechaValor = data[`fecha_req_${req.id_requisito_documento}`];

      if (req.es_obligatorio) {
        if (!docGuardado && !archivoLocal) {
          toast.error("Documentación Incompleta", {
            description: `El documento "${req.nombre_documento}" es obligatorio para dar de alta esta unidad.`,
          });
          return;
        }

        if (req.requiere_vencimiento && !fechaValor && (archivoLocal || docGuardado)) {
          toast.error("Fecha de Vencimiento Requerida", {
            description: `Debe registrar la vigencia para "${req.nombre_documento}".`,
          });
          return;
        }
      }
    }

    if (!initialData && fotosLocales.length === 0) {
      toast.error("Falta Registro Fotográfico", {
        description: "Debe subir al menos una fotografía de la unidad (frontal/lateral) para su identificación visual."
      });
      return;
    }

    const fechasEnvio: Record<number, string> = {};
    requisitos.forEach((req) => {
      const fechaValor = data[`fecha_req_${req.id_requisito_documento}`];
      if (fechaValor) {
        fechasEnvio[req.id_requisito_documento] = fechaValor;
      }
    });

    const payloadUnidad = {
      placa: data.placa.toUpperCase().trim(),
      id_categoria: parseInt(data.id_categoria),
      num_chasis: data.num_chasis.toUpperCase().trim(),
      marca: data.marca.trim().toUpperCase(),
      color: data.color.trim().toUpperCase(),
      anio: parseInt(data.anio),
      modelo: data.modelo.trim().toUpperCase(),
      estado_unidad: data.estado_unidad,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payloadUnidad, archivosSeleccionados, fechasEnvio, fotosLocales, fotosParaEliminar);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEliminarFotoExistente = (idFoto: number) => {
    // Marca la foto para eliminar y la quita de la vista
    setFotosParaEliminar(prev => [...prev, idFoto]);
    setFotosExistentes(prev => prev.filter(f => f.id_foto !== idFoto));
  };



  return (
    <form onSubmit={handleSubmit(handleValidationAndSubmit)} className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* SECCIÓN 1: TIPO DE UNIDAD — solo visible en modo edición/registro */}
      {!isReadOnly && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-[var(--yuriana-base-orange)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[var(--yuriana-base-black)]">
            <Truck size={20} className="text-[var(--yuriana-section-icon)]" />
            <h3 className="font-bold uppercase text-sm tracking-tight">Tipo de Unidad</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoriasValidadas.map((cat) => {
              const esSeleccionado = categoriaSeleccionadaId === cat.id_categoria.toString();
              return (
                <button
                  key={cat.id_categoria}
                  type="button"
                  onClick={() => setValue("id_categoria", cat.id_categoria.toString(), { shouldValidate: true })}
                  className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 transition-all gap-2 font-bold uppercase tracking-tight text-xs h-32 ${
                    esSeleccionado
                      ? "bg-[var(--yuriana-base-yellow)] text-white border-[var(--yuriana-base-yellow)] shadow-md scale-102"
                      : "bg-white text-[var(--yuriana-base-black)] border-[var(--yuriana-base-orange)] hover:border-gray-300 hover:bg-slate-50"
                  }`}
                >
                  <Truck size={24} className={esSeleccionado ? "text-white" : "text-[var(--yuriana-base-black)]"} />
                  <span>{cat.tipo_categoria}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("id_categoria", { required: "Debe seleccionar la clasificación del transporte" })} />
          {errors.id_categoria && <span className="text-xs text-[var(--yuriana-input-error)] font-bold ml-1">{errors.id_categoria.message as string}</span>}
        </div>
      )}
      {/* Input oculto necesario para que watch() funcione en modo lectura */}
      {isReadOnly && <input type="hidden" {...register("id_categoria")} />}

      {/* SECCIÓN 2: INFORMACIÓN GENERAL */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-black)] border-b border-border pb-4">
          <Info size={20} className="text-yuriana-section-icon" />
          <h3 className="font-bold uppercase text-sm tracking-tight">Información General</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {/* Tipo de Unidad integrado en la grilla — solo en modo lectura */}
          {isReadOnly && (() => {
            const cat = categoriasValidadas.find(c => c.id_categoria.toString() === categoriaSeleccionadaId);
            return (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1">
                  Tipo de Unidad
                </label>
                <div className="w-full bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--yuriana-base-orange)] shrink-0">
                    <Truck size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-[var(--yuriana-base-gray-dark)] uppercase tracking-wide">
                    {cat?.tipo_categoria ?? '—'}
                  </span>
                </div>
              </div>
            );
          })()}
          <ModuleField label="Placa" name="placa" register={register} disabled={isReadOnly || !!initialData} error={errors.placa} rules={{ required: "La placa es obligatoria" }} />
          <ModuleField label="Número de Chasis" name="num_chasis" register={register} disabled={isReadOnly} error={errors.num_chasis} rules={{ required: "El chasis es obligatorio" }} />
          <ModuleField label="Marca" name="marca" register={register} disabled={isReadOnly} error={errors.marca} rules={{ required: "La marca es obligatoria" }} />
          <ModuleField label="Modelo" name="modelo" register={register} disabled={isReadOnly} error={errors.modelo} rules={{ required: "El modelo es obligatorio" }} />
          <ModuleField label="Color" name="color" register={register} disabled={isReadOnly} error={errors.color} rules={{ required: "El color es obligatorio" }} />
          <ModuleField label="Año" name="anio" type="number" register={register} disabled={isReadOnly} error={errors.anio} rules={{ required: "El año es obligatorio", min: { value: 1990, message: "El año mínimo es 1990" }, max: { value: new Date().getFullYear(), message: `El año no puede ser mayor a ${new Date().getFullYear()}` }, validate: (v: any) => parseInt(v) >= 1990 || "El año mínimo es 1990" }} />
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1">Estado</label>
            {initialData && (initialData.estado_unidad === EstadoUnidad.ASIGNADO || initialData.estado_unidad === EstadoUnidad.EN_VIAJE) ? (
              <div className="w-full bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium text-slate-500">
                {initialData.estado_unidad === EstadoUnidad.ASIGNADO ? "Asignado" : "En Viaje"}
                <span className="ml-2 text-[10px] text-slate-400 font-bold">(automático)</span>
              </div>
            ) : (
              <select {...register("estado_unidad")} disabled={isReadOnly} className="w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium outline-none">
                <option value={EstadoUnidad.DISPONIBLE}>Disponible</option>
                <option value={EstadoUnidad.MANTENIMIENTO}>En Mantenimiento</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: EXPEDIENTES LEGALES */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-black)] border-b border-border pb-4">
          <FileText size={20} className="text-yuriana-section-icon" />
          <h3 className="font-bold uppercase text-sm tracking-tight">Documentación Requerida</h3>
        </div>

        {!categoriaSeleccionadaId ? (
          <div className="text-center py-12 text-sm italic text-gray-400 border border-dashed border-border rounded-2xl bg-gray-50/50">
            Seleccione el tipo de transporte en la sección superior para cargar sus requisitos.
          </div>
        ) : loadingReqs ? (
          <div className="text-center py-12 text-sm italic text-gray-400 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-[var(--yuriana-base-orange)]" />
            Sincronizando requisitos...
          </div>
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
                          {archivoLocal ? `✓ En cola: ${archivoLocal.name.substring(0, 12)}...` : docGuardado ? "✓ Almacenado" : "⚠ Sin archivo"}
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
                          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleSeleccionarArchivoLocal(req.id_requisito_documento, e)} />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <input type="date" disabled={isReadOnly || !req.requiere_vencimiento} {...register(`fecha_req_${req.id_requisito_documento}`)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold outline-none focus:border-[var(--yuriana-base-orange)] text-gray-700 disabled:bg-gray-100" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN 4: GALERÍA DE FOTOS MULTI-IMAGEN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-black)] border-b border-border pb-4">
            <ImageIcon size={20} className="text-yuriana-section-icon" />
            <h3 className="font-bold uppercase text-sm tracking-tight">Fotos de la Unidad</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Renderizado de fotos ya guardadas en Cloudinary */}
            {(fotosExistentes || []).map((foto, idx) => {
            return (
                <div 
                key={foto?.id_foto || idx} 
                onClick={() => setFotoExpandidaUrl(foto?.url_foto)}
                className="relative aspect-square rounded-2xl border border-border overflow-hidden group shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-98"
                >
                <img 
                    src={foto?.url_foto} 
                    alt={`Foto de la unidad ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error+al+cargar+imagen";
                    }}
                />
                {!isReadOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminarFotoExistente(foto.id_foto);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors z-10 opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              )}

                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <span className="text-[10px] text-white font-black uppercase tracking-wider">Almacenada</span>
                    {isReadOnly && (
                      <span className="text-[9px] text-amber-300 font-bold">Clic para expandir</span>
                    )}
                </div>
                </div>
            );
            })}

            {/* Renderizado de la cola de nuevas imágenes locales */}
            {previewsLocales.map((src, index) => (
            <div 
                key={index} 
                className="relative aspect-square rounded-2xl border border-blue-200 overflow-hidden group shadow-md animate-in zoom-in-95"
            >
                <img 
                src={src} 
                alt="Cola" 
                onClick={() => setFotoExpandidaUrl(src)}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300" 
                />
                {!isReadOnly && (
                <button
                    type="button"
                    onClick={(e) => {
                    e.stopPropagation(); // Evita que abra el modal al presionar la X
                    handleRemoverFotoCola(index);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors z-10"
                >
                    <X size={12} />
                </button>
                )}
                <div 
                onClick={() => setFotoExpandidaUrl(src)}
                className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none"
                >
                <span className="text-[8px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase">En Cola</span>
                </div>
            </div>
            ))}

            {/* Botón interactivo para agregar fotos */}
            {!isReadOnly && (fotosLocales.length + fotosExistentes.length < 10) && (
            <label className="border-2 border-dashed border-[var(--yuriana-base-orange)] rounded-2xl flex flex-col items-center justify-center p-4 aspect-square cursor-pointer hover:border-[var(--yuriana-base-orange)] hover:bg-slate-50 transition-all gap-2 text-center text-gray-400">
                <Plus size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Agregar Foto</span>
                <span className="text-[9px] text-[var(--yuriana-base-black)]">({fotosLocales.length + fotosExistentes.length}/10)</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleSeleccionarFotosUnidad} />
            </label>
            )}
        </div>
        </div>

      {/* BOTONERÍA */}
      <div className="flex justify-end gap-4 pt-2">
        <button type="button" disabled={isSubmitting} onClick={onCancel} className="px-10 py-4 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 text-sm uppercase">
          {isReadOnly ? "Cerrar" : "Cancelar"}
        </button>
        {!isReadOnly && (
          <button type="submit" disabled={isSubmitting || !categoriaSeleccionadaId} className="px-10 py-4 bg-[var(--yuriana-base-yellow)] text-black rounded-xl font-black text-sm uppercase flex items-center gap-2 shadow-lg disabled:bg-gray-200 disabled:text-gray-400">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            <span>{initialData ? "Actualizar Unidad" : "Guardar Unidad"}</span>
          </button>
        )}
      </div>


        {/* MODAL VISOR EN ALTA RESOLUCIÓN */}
      {fotoExpandidaUrl && (
        <div 
          onClick={() => setFotoExpandidaUrl(null)} 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full mx-4 p-2 animate-in zoom-in-95 duration-200">
            {/* Botón flotante para cerrar */}
            <button
              type="button"
              onClick={() => setFotoExpandidaUrl(null)}
              className="absolute -top-12 right-2 bg-white/10 hover:bg-white/20 text-white rounded-xl p-2 transition-colors border border-white/20"
            >
              <X size={20} />
            </button>
            
            {/* Contenedor de la Imagen Expandida */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-slate-950/20">
              <img
                src={fotoExpandidaUrl}
                alt="Vista detallada de la unidad"
                onClick={(e) => e.stopPropagation()} // Detiene el cierre al hacer clic sobre la foto
                className="max-w-full max-h-[80vh] object-contain select-none cursor-default"
              />
            </div>
          </div>
        </div>
      )}
      
    </form>
  );
};