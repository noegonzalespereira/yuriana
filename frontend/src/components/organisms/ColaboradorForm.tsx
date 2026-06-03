// src/components/organisms/ColaboradorForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { TipoColaborador, Colaborador } from "@/types/colaborador.types";
import { TypeSelector } from "../atoms/TypeSelector";
import { Truck, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { ModuleField } from "../molecules/ModuleField";

interface Props {
  initialData?: Colaborador | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export const ColaboradorForm = ({ initialData, onSubmit, onCancel, isReadOnly }: Props) => {
  const [tipo, setTipo] = useState<TipoColaborador>(TipoColaborador.ATA);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (initialData) {
      setTipo(initialData.tipo_colaborador);
      reset({
        ...initialData.persona,
        agencia: initialData.agencia,
        monto: initialData.monto,
        notas: initialData.notas, // Sincronizado correctamente
      });
    } else {
      reset({ ci: "", nombre: "", correo: "", telefono: "", telefono2: "", agencia: "", ciudad: "", monto: "", notas: "" });
      setTipo(TipoColaborador.ATA);
    }
  }, [initialData, reset]);

  const handleLocalSubmit = (data: any) => {
    const payload = {
      ...data,
      nombre: data.nombre?.trim().toUpperCase(),
      correo: data.correo,
      agencia: data.agencia?.trim().toUpperCase() || "",
      ciudad: data.ciudad?.trim().toUpperCase() || "",
      notas: data.notas?.trim().toUpperCase() || "",
      ci: data.ci ? parseInt(data.ci) : 0,
      monto: data.monto ? parseFloat(data.monto) : 0,
      telefono: data.telefono ? parseInt(data.telefono) : 0,
      telefono2: data.telefono2 ? parseInt(data.telefono2) : undefined,
      tipo_colaborador: tipo,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECCIÓN 1: TIPO DE COLABORADOR */}
      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-[var(--yuriana-base-orange)]">
          <Truck size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Tipo de colaborador</h3>
        </div>
        <TypeSelector selected={tipo} onChange={setTipo} disabled={isReadOnly} />
      </div>

      {/* SECCIÓN 2: INFORMACIÓN GENERAL */}
      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm space-y-8">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-[var(--yuriana-card-border)] pb-4">
          <Info size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Información General</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField 
            label="CI / NIT" 
            name="ci" 
            type="number"
            register={register} 
            disabled={isReadOnly || !!initialData} 
            error={errors.ci}
            rules={{ required: "El CI / NIT es obligatorio" }}
          />
          
          <ModuleField 
            label="Nombre" 
            name="nombre" 
            register={register} 
            disabled={isReadOnly} 
            error={errors.nombre}
            rules={{ required: "El nombre es obligatorio" }}
          />
          
          <ModuleField 
            label="Correo" 
            name="correo" 
            type="email" 
            register={register} 
            disabled={isReadOnly} 
            error={errors.correo}
            rules={{ 
              required: "El correo es obligatorio",
              pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" }
            }}
          />
          
          <ModuleField 
            label="Teléfono" 
            name="telefono" 
            type="number"
            register={register} 
            disabled={isReadOnly} 
            error={errors.telefono}
            rules={{ required: "El teléfono es obligatorio", minLength: { value: 7, message: "Mínimo 7 dígitos" } }}
          />
          
          <ModuleField 
            label="Teléfono 2" 
            name="telefono2" 
            type="number"
            register={register} 
            disabled={isReadOnly} 
          />
          
          <ModuleField 
            label="Agencia" 
            name="agencia" 
            register={register} 
            disabled={isReadOnly} 
            error={errors.agencia}
            rules={{ required: "La agencia es obligatoria" }}
          />
          
          <ModuleField 
            label="Ciudad" 
            name="ciudad" 
            register={register} 
            disabled={isReadOnly} 
            error={errors.ciudad}
            rules={{ required: "La ciudad es obligatoria" }}
          />
          
          <ModuleField 
            label="Monto" 
            name="monto" 
            type="number" 
            register={register} 
            disabled={isReadOnly} 
            unit="Bs" 
            error={errors.monto}
            rules={{ required: "El monto es obligatorio" }}
          />
          
          <ModuleField 
            label="Notas" 
            name="notas" 
            register={register} 
            disabled={isReadOnly} 
          />
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-10 py-4 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg text-sm uppercase tracking-tighter"
        >
          {isReadOnly ? "Cerrar" : "Cancelar"}
        </button>
        {!isReadOnly && (
          <button 
            type="submit" 
            className="px-10 py-4 bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] rounded-xl font-black hover:shadow-xl transition-all shadow-lg text-sm uppercase tracking-tighter"
          >
            {initialData ? "Actualizar Colaborador" : "Guardar Colaborador"}
          </button>
        )}
      </div>
    </form>
  );
};