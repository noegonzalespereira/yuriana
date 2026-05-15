"use client";
import { useForm } from "react-hook-form";
import { Rol, User } from "@/types/auth.types";
import { X } from "lucide-react";
import { useEffect } from "react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  roles: Rol[];
  initialData?: User | null; // Cambiado a User | null para mejor tipado
  isReadOnly?: boolean;      // Nueva propiedad para el modo "Ver"
}

export const UserFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roles, 
  initialData, 
  isReadOnly = false 
}: UserFormModalProps) => {
  
  const { register, handleSubmit, reset } = useForm();

  // Sincroniza los datos del formulario con el usuario seleccionado
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          nombre: initialData.nombre,
          correo: initialData.correo,
          id_rol: initialData.rol?.id_rol || initialData.id_rol,
          estado: initialData.estado
        });
      } else {
        // Limpiar para nuevo usuario
        reset({ nombre: "", correo: "", password: "", id_rol: roles[0]?.id_rol || "", estado: "activo" });
      }
    }
  }, [initialData, reset, isOpen, roles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-all border border-gray-100">
        
        {/* Encabezado Naranja */}
        <div className="bg-yuriana-orange p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {isReadOnly ? 'Detalles del' : initialData ? 'Editar' : 'Nuevo'} Usuario
          </h2>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 transition-transform p-1 bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
            <input 
              {...register("nombre")} 
              disabled={isReadOnly}
              className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-yuriana-yellow disabled:bg-transparent disabled:text-gray-600 font-medium transition-colors" 
              placeholder="Ej. Juan Perez"
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo Electrónico</label>
            <input 
              {...register("correo")} 
              disabled={isReadOnly}
              type="email" 
              className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-yuriana-yellow disabled:bg-transparent disabled:text-gray-600 font-medium transition-colors" 
              placeholder="correo@ejemplo.com"
              required 
            />
          </div>
          
          {/* Solo mostramos contraseña si es un usuario nuevo y NO es modo lectura */}
          {!initialData && !isReadOnly && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña Temporal</label>
              <input 
                {...register("password")} 
                type="password" 
                className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-yuriana-yellow font-medium transition-colors" 
                placeholder="Mínimo 6 caracteres"
                required 
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol de Sistema</label>
            <select 
              {...register("id_rol")} 
              disabled={isReadOnly}
              className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-yuriana-yellow bg-transparent disabled:text-gray-600 font-medium transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled>Seleccione un rol</option>
              {roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          
          {/* Botón de Guardar: Desaparece en modo lectura */}
          {!isReadOnly && (
            <button 
              type="submit" 
              className="w-full bg-yuriana-yellow text-black font-black py-4 rounded-2xl mt-6 shadow-lg hover:shadow-yuriana-yellow/30 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-sm"
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};