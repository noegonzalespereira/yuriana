// src/components/organisms/ClienteForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { Cliente } from "@/types/cliente.types";
import { Info, User } from "lucide-react";
import { useEffect } from "react";
import { ModuleField } from "../molecules/ModuleField";

interface Props {
  initialData?: Cliente | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export const ClienteForm = ({ initialData, onSubmit, onCancel, isReadOnly }: Props) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        ...initialData.persona,
      });
    } else {
      reset({ codigo_cliente: "", nit: "", razon_social: "", direccion: "", nombre: "", ci: "", correo: "", telefono: "", telefono2: "", ciudad: "", notas: "" });
    }
  }, [initialData, reset]);

  const handleLocalSubmit = (data: any) => {
    const { codigo_cliente, ...rest } = data;
    const payload = {
      ...rest,
      razon_social: data.razon_social?.trim().toUpperCase(),
      nombre: data.nombre?.trim().toUpperCase(),
      ciudad: data.ciudad?.trim().toUpperCase(),
      direccion: data.direccion?.trim().toUpperCase() || "",
      notas: data.notas?.trim().toUpperCase() || "",
      correo: data.correo,
      nit: data.nit ? parseInt(data.nit) : 0,
      ci: data.ci ? parseInt(data.ci) : 0,
      telefono: data.telefono ? parseInt(data.telefono) : 0,
      telefono2: data.telefono2 ? parseInt(data.telefono2) : 0,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-[var(--yuriana-card-border)] pb-4">
          <Info size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Datos de la empresa</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField label="Codigo Cliente" name="codigo_cliente" register={register} disabled={true} placeholder="Autogenerado" />
          <ModuleField label="NIT" name="nit" type="number" register={register} disabled={isReadOnly} error={errors.nit} rules={{ required: "El NIT es obligatorio" }} />
          <ModuleField label="Razón Social" name="razon_social" register={register} disabled={isReadOnly} error={errors.razon_social} rules={{ required: "La razón social es obligatoria" }} />
          <ModuleField label="Correo" name="correo" type="email" register={register} disabled={isReadOnly} error={errors.correo} rules={{ required: "El correo es obligatorio", pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" } }} />
          <ModuleField label="Ciudad" name="ciudad" register={register} disabled={isReadOnly} error={errors.ciudad} rules={{ required: "La ciudad es obligatoria" }} />
          <ModuleField label="Dirección" name="direccion" register={register} disabled={isReadOnly} />
        </div>
      </div>

      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-[var(--yuriana-card-border)] pb-4">
          <User size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Datos del cliente</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField label="CI" name="ci" type="number" register={register} disabled={isReadOnly} error={errors.ci} rules={{ required: "El CI es obligatorio" }} />
          <ModuleField label="Nombre Cliente" name="nombre" register={register} disabled={isReadOnly} error={errors.nombre} rules={{ required: "El nombre es obligatorio" }} />
          <ModuleField label="Teléfono" name="telefono" type="number" register={register} disabled={isReadOnly} error={errors.telefono} rules={{ required: "Requerido", minLength: { value: 7, message: "Mínimo 7 dígitos" } }} />
          <ModuleField label="Teléfono 2" name="telefono2" type="number" register={register} disabled={isReadOnly} />
          <ModuleField label="Notas" name="notas" register={register} disabled={isReadOnly} />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="px-10 py-4 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg text-sm uppercase tracking-tighter">
          {isReadOnly ? "Cerrar" : "Cancelar"}
        </button>
        {!isReadOnly && (
          <button type="submit" className="px-10 py-4 bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] rounded-xl font-bold hover:shadow-xl transition-all shadow-lg text-sm uppercase tracking-tighter">
            {initialData ? "Actualizar Cliente" : "Guardar Cliente"}
          </button>
        )}
      </div>
    </form>
  );
};