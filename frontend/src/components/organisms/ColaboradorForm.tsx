"use client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TipoColaborador, Colaborador } from "@/types/colaborador.types";
import { TypeSelector } from "../atoms/TypeSelector";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { ModuleField } from "../molecules/ModuleField";
import { FormActions } from "../atoms/FormActions";

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
        notas: initialData.notas,
      });
    } else {
      reset({ ci: "", nombre: "", correo: "", telefono: "", telefono2: "", agencia: "", ciudad: "", monto: "", notas: "" });
      setTipo(TipoColaborador.ATA);
    }
  }, [initialData, reset]);

  const MAX_TELEFONO = 999_999_999_999_999; // 15 dígitos

  const [saving, setSaving] = useState(false);

  const handleLocalSubmit = async (data: any) => {
    const tel = data.telefono ? parseInt(data.telefono) : 0;
    const tel2 = data.telefono2 ? parseInt(data.telefono2) : undefined;

    if (tel > MAX_TELEFONO)
      return toast.error("El teléfono supera el límite permitido (máx. 15 dígitos)");
    if (tel2 !== undefined && tel2 > MAX_TELEFONO)
      return toast.error("El teléfono 2 supera el límite permitido (máx. 15 dígitos)");

    const payload: Record<string, any> = {
      ci: data.ci?.trim() || undefined,
      nombre: data.nombre?.trim().toUpperCase(),
      correo: data.correo,
      telefono: tel,
      ciudad: data.ciudad?.trim().toUpperCase() || "",
      agencia: data.agencia?.trim() ? data.agencia.trim().toUpperCase() : undefined,
      monto: data.monto ? parseFloat(data.monto) : 0,
      notas: data.notas?.trim().toUpperCase() || "",
      tipo_colaborador: tipo,
    };
    if (tel2 !== undefined) payload.telefono2 = tel2;
    try {
      setSaving(true);
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-6 animate-in fade-in duration-500">

      {/* Tarjeta única con secciones internas */}
      <div className="bg-[var(--yuriana-base-white)] rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm overflow-hidden">

        {/* Header de la tarjeta */}
        <div className="flex items-center gap-3 px-8 py-5 border-b border-[var(--yuriana-card-border)] bg-slate-50/60">
          <div className="p-2 rounded-xl bg-[var(--yuriana-base-orange)]/10 text-[var(--yuriana-base-orange)]">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-black uppercase text-sm tracking-tight text-[var(--yuriana-base-gray-dark)]">
              {initialData ? "Datos del Colaborador" : "Nuevo Colaborador"}
            </h3>
            <p className="text-[10px] text-[var(--yuriana-input-placeholder)] font-medium">
              Complete todos los campos requeridos
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* Sección: Tipo */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">
              Tipo de Colaborador {!isReadOnly && <span className="text-red-500">*</span>}
            </p>
            {isReadOnly ? (
              <span className="inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--yuriana-base-yellow)] text-white shadow-sm">
                {tipo === "ATA" ? "ATA" : "Agencia Despachante"}
              </span>
            ) : (
              <TypeSelector selected={tipo} onChange={setTipo} />
            )}
          </div>

          <div className="border-t border-dashed border-[var(--yuriana-card-border)]" />

          {/* Sección: Identidad */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-placeholder)]">
              Identificación
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <ModuleField
                label="Nombre"
                name="nombre"
                register={register}
                disabled={isReadOnly}
                error={errors.nombre}
                rules={{ required: "El nombre es obligatorio" }}
              />
              
              <ModuleField
                label="CI / NIT"
                name="ci"
                type="text"
                inputMode="numeric"
                register={register}
                disabled={isReadOnly}
                error={errors.ci}
                rules={{
                  validate: (value: string) => {
                    if (!value) return true;
                    if (!/^\d+$/.test(value)) return "El CI/NIT solo debe contener números";
                    if (Number(value) <= 0) return "El CI/NIT debe ser un número positivo";
                    if (value.length < 5) return "El CI debe tener al menos 5 dígitos";
                    return true;
                  },
                }}
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
                  pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" },
                }}
              />
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--yuriana-card-border)]" />

          {/* Sección: Contacto */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-placeholder)]">
              Contacto y Ubicación
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <ModuleField
                label="Teléfono"
                name="telefono"
                type="number"
                register={register}
                disabled={isReadOnly}
                error={errors.telefono}
                rules={{ required: "El teléfono es obligatorio", validate: (v: string) => !v || /^\d{8,15}$/.test(v) || "El teléfono debe tener entre 8 y 15 dígitos " }}
              />
              <ModuleField
                label="Teléfono 2"
                name="telefono2"
                type="number"
                register={register}
                disabled={isReadOnly}
                error={errors.telefono2}
                rules={{ validate: (v: string) => !v || /^\d{8,15}$/.test(v) || "El teléfono debe tener entre 8 y 15 dígitos " }}
              />
              <ModuleField
                label="Ciudad"
                name="ciudad"
                register={register}
                disabled={isReadOnly}
                error={errors.ciudad}
                rules={{ required: "La ciudad es obligatoria" }}
              />
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--yuriana-card-border)]" />

          {/* Sección: Negocio */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-placeholder)]">
              Datos Comerciales
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <ModuleField
                label="Agencia"
                name="agencia"
                register={register}
                disabled={isReadOnly}
                error={errors.agencia}
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

        </div>
      </div>

      <FormActions onCancel={onCancel} isReadOnly={isReadOnly} isSubmitting={saving} isEditing={!!initialData} entityLabel="Colaborador" />
    </form>
  );
};
