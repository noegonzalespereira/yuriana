// src/components/organisms/UserForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { Rol, User, EstadoUsuario } from "@/types/auth.types";
import { Info, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { ModuleField } from "../molecules/ModuleField";
import { FormActions } from "../atoms/FormActions";

interface UserFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  roles: Rol[];
  initialData?: User | null;
  isReadOnly?: boolean;
}

export const UserForm = ({ onSubmit, onCancel, roles, initialData, isReadOnly = false }: UserFormProps) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        correo: initialData.correo,
        id_rol: initialData.rol?.id_rol || initialData.id_rol,
        estado: initialData.estado
      });
    } else {
      reset({ nombre: "", correo: "", password: "", id_rol: roles[0]?.id_rol || "", estado: EstadoUsuario.ACTIVO });
    }
  }, [initialData, reset, roles]);

  const handleLocalSubmit = async (data: any) => {
    const payload: Record<string, any> = {
      nombre: data.nombre?.trim().toUpperCase(),
      correo: data.correo,
      id_rol: parseInt(data.id_rol, 10), 
    };

    if (initialData) {
      // Si estamos editando, incluimos el estado.
      payload.estado = data.estado;
      // Solo enviamos la contraseña si el usuario ha escrito algo.
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }
    } else {
      // Si estamos creando, incluimos la contraseña.
      payload.password = data.password;
    }

    try {
      setSaving(true);
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-6 animate-in fade-in duration-500">
      
      {/* SECCIÓN 1: DATOS DE CREDENCIALES Y ROL */}
      <div className="bg-[var(--yuriana-base-white)] p-8 rounded-[2.5rem] border border-[var(--yuriana-card-border)] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[var(--yuriana-base-orange)] border-b border-[var(--yuriana-card-border)] pb-4">
          <ShieldAlert size={20} />
          <h3 className="font-bold uppercase text-sm tracking-tight">Seguridad y Roles</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <ModuleField 
            label="Nombre Completo" 
            name="nombre" 
            register={register} 
            disabled={isReadOnly}
            error={errors.nombre}
            rules={{ required: "El nombre es obligatorio" }}
            placeholder="Ej. Juan Perez"
          />

          <ModuleField 
            label="Correo Electrónico" 
            name="correo" 
            type="email"
            register={register} 
            disabled={isReadOnly}
            error={errors.correo}
            rules={{ 
              required: "El correo es obligatorio",
              pattern: { value: /^\S+@\S+$/i, message: "Correo electrónico inválido" }
            }}
            placeholder="correo@ejemplo.com"
          />
          
           

          <div className="flex flex-col gap-1 w-full text-left">
            <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1">
              Rol de Sistema
            </label>
            <select 
              {...register("id_rol", { required: "El rol es mandatorio" })} 
              disabled={isReadOnly}
              className="w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium text-[var(--yuriana-input-text)] focus:border-[var(--yuriana-input-border-focus)] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
            >
              <option value="" disabled>Seleccione un rol</option>
              {roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre.toUpperCase()}
                </option>
              ))}
            </select>
            {errors.id_rol && (
              <span className="text-[9px] text-[var(--yuriana-input-error)] font-bold ml-1 uppercase tracking-tighter">
                {errors.id_rol.message as string}
              </span>
            )}
          </div>
          <ModuleField 
              label="Contraseña Temporal" 
              name="password" 
              type="password"
              register={register} 
              disabled={isReadOnly}

              rules={{ 
                // La contraseña solo es obligatoria si estamos creando un nuevo usuario.
                required: !initialData ? "La contraseña es requerida" : false,
                // La validación de longitud se aplica solo si se escribe algo.
                minLength: { value: 6, message: "Mínimo 6 caracteres" } 
              }}
              error={errors.password}
              placeholder="••••••••"
            />

          {initialData && (
            <div className="flex flex-col gap-2 w-full text-left">
              <label className="text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1">
                Estado del Operario
              </label>
              <select 
                {...register("estado")} 
                disabled={isReadOnly}
                className="w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-3 px-4 text-sm font-medium text-[var(--yuriana-input-text)] focus:border-[var(--yuriana-input-border-focus)] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
              >
                <option value={EstadoUsuario.ACTIVO}>Activo</option>
                <option value={EstadoUsuario.INACTIVO}>Inactivo</option>
              </select>

              
            
          
            </div>
            
          

          )}
        </div>
      </div>

      <FormActions onCancel={onCancel} isReadOnly={isReadOnly} isSubmitting={saving} isEditing={!!initialData} entityLabel="Operario" />
    </form>
  );
};