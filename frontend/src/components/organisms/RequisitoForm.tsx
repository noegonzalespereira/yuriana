"use client";
import { useForm, Controller } from "react-hook-form";
import { RequisitoDocumento } from "@/types/documento.types";
import { ModuleField } from "../molecules/ModuleField";
import { FormActions } from "../atoms/FormActions";
import { useEffect, useState } from "react";

interface Props {
  initialData?: RequisitoDocumento | null;
  idCategoriaActiva: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export const RequisitoForm = ({ initialData, idCategoriaActiva, onSubmit, onCancel, isReadOnly }: Props) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      nombre_documento: "",
      es_obligatorio: true,
      requiere_vencimiento: false,
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nombre_documento: initialData.nombre_documento,
        es_obligatorio: initialData.es_obligatorio,
        requiere_vencimiento: initialData.requiere_vencimiento,
      });
    }
  }, [initialData, reset]);

  const handleLocalSubmit = async (data: any) => {
    const payload = {
      ...data,
      // Forzamos conversión estricta al id_categoria numérico del flujo activo
      id_categoria: parseInt(idCategoriaActiva.toString()),
      es_obligatorio: Boolean(data.es_obligatorio),
      requiere_vencimiento: Boolean(data.requiere_vencimiento),
    };
    console.log("Payload de Requisito verificado listo:", payload);
    try {
      setSaving(true);
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="bg-white p-8 rounded-[2.5rem] border border-yuriana-orange/20 shadow-xl max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        
        {/* INPUT DE NOMBRE USANDO NUESTRA MOLÉCULA */}
        <div className="md:col-span-1">
          <ModuleField 
            label="Nombre del documento"
            name="nombre_documento"
            placeholder="Ej. Licencia Federal de Conducir"
            register={register}
            disabled={isReadOnly}
            error={errors.nombre_documento}
            rules={{ required: "El nombre es mandatorio" }}
          />
        </div>

        {/* TOGGLE 1: OBLIGATORIO */}
        <div className="flex flex-col gap-2 justify-center pb-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Es Obligatorio</label>
          <span className="text-[11px] text-gray-400 block -mt-1">Requerido para operación</span>
          <Controller
            name="es_obligatorio"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => field.onChange(!field.value)}
                className={`w-12 h-6 flex items-center rounded-full p-1 mt-1 duration-300 transition-colors ${field.value ? 'bg-yuriana-orange' : 'bg-gray-200'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${field.value ? 'translate-x-6' : ''}`} />
              </button>
            )}
          />
        </div>

        {/* TOGGLE 2: VENCIMIENTO */}
        <div className="flex flex-col gap-2 justify-center pb-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pide Fecha</label>
          <span className="text-[11px] text-gray-400 block -mt-1">Requiere vencimiento</span>
          <Controller
            name="requiere_vencimiento"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => field.onChange(!field.value)}
                className={`w-12 h-6 flex items-center rounded-full p-1 mt-1 duration-300 transition-colors ${field.value ? 'bg-yuriana-orange' : 'bg-gray-200'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${field.value ? 'translate-x-6' : ''}`} />
              </button>
            )}
          />
        </div>
      </div>

      <FormActions onCancel={onCancel} isReadOnly={isReadOnly} isSubmitting={saving} isEditing={!!initialData} entityLabel="Documento" />
    </form>
  );
};