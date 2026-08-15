// src/components/organisms/ClienteForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { Cliente } from "@/types/cliente.types";
import { Info, User } from "lucide-react";
import { FormActions } from "../atoms/FormActions";
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
    const payload = {
      // Datos de Persona
      nombre: data.nombre?.trim().toUpperCase(),
      ci: data.ci ? parseInt(data.ci, 10) : undefined,
      correo: data.correo?.trim() || undefined,
      telefono: data.telefono ? parseInt(data.telefono, 10) : undefined,
      telefono2: data.telefono2 ? parseInt(data.telefono2, 10) : undefined,
      ciudad: data.ciudad?.trim().toUpperCase() || undefined,

      // Datos de Cliente
      nit: data.nit ? parseInt(data.nit, 10) : undefined,
      razon_social: data.razon_social?.trim().toUpperCase() || undefined,
      direccion: data.direccion?.trim().toUpperCase() || undefined,
      notas: data.notas?.trim() || undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-[var(--yuriana-card-border)] pb-4">
          <Info size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Datos del cliente</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField label="Codigo Cliente" name="codigo_cliente" register={register} disabled={true} placeholder="Autogenerado" />
          <ModuleField label="NIT" name="nit" type="number" register={register} disabled={isReadOnly} error={errors.nit} rules={{ validate: (v: string) => !v || /^\d{1,15}$/.test(v) || "El NIT no puede tener más de 15 dígitos" }} />
          <ModuleField label="Razón Social" name="razon_social" register={register} disabled={isReadOnly} />
          <ModuleField label="Correo" name="correo" type="email" register={register} disabled={isReadOnly} error={errors.correo} rules={{ validate: (v: string) => !v || /^\S+@\S+\.\S+$/.test(v) || "Correo inválido" }} />
          <ModuleField label="Ciudad" name="ciudad" register={register} disabled={isReadOnly} />
          <ModuleField label="Dirección" name="direccion" register={register} disabled={isReadOnly} />
        </div>
      </div>

      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-[var(--yuriana-card-border)] pb-4">
          <User size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Datos del contacto</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField label="CI" name="ci" type="number" register={register} disabled={isReadOnly} error={errors.ci} rules={{ validate: (v: string) => !v || (Number(v) >= 10000 && Number(v) <= 99999999) || "El CI debe tener entre 5 y 8 dígitos" }} />
          <ModuleField label="Nombre del Contacto" name="nombre" register={register} disabled={isReadOnly} error={errors.nombre} rules={{ required: "El nombre es obligatorio" }} />
          <ModuleField label="Teléfono" name="telefono" type="number" register={register} disabled={isReadOnly} error={errors.telefono} rules={{ required: "Requerido", validate: (v: string) => !v || /^\d{8,15}$/.test(v) || "El teléfono debe tener entre 8 y 15 dígitos (ej: 68626895)" }} />
          <ModuleField label="Teléfono 2" name="telefono2" type="number" register={register} disabled={isReadOnly} error={errors.telefono2} rules={{ validate: (v: string) => !v || /^\d{8,15}$/.test(v) || "El teléfono debe tener entre 8 y 15 dígitos (ej: 68626895)" }} />
          <ModuleField label="Notas" name="notas" register={register} disabled={isReadOnly} />
        </div>
      </div>

      <FormActions onCancel={onCancel} isReadOnly={isReadOnly} isEditing={!!initialData} entityLabel="Cliente" />
    </form>
  );
};