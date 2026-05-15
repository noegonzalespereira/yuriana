"use client"; // Necesario para usar hooks
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Importamos el hook de autenticación
import { SidebarConfigMenu } from "../atoms/SidebarConfigMenu";
export const UserCard = () => {
  const { user, logout } = useAuth(); // Extraemos el usuario y la función de salida

  // Obtenemos las iniciales (ej: "Carlos Mendoza" -> "CM")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Bloque de Información del Usuario */}
      <div className="bg-black/20 p-4 rounded-2xl flex items-center justify-between shadow-inner">
        <div className="flex flex-col max-w-[120px]">
          <span className="text-white font-bold text-sm truncate leading-tight">
            {user?.nombre || "Cargando..."} {/* Nombre real del backend */}
          </span>
          <span className="text-white/70 text-[10px] font-medium uppercase tracking-tighter">
            {typeof user?.rol === 'object' ? user.rol.nombre : (user?.rol || "Usuario")}
          </span>
        </div>
        
        {/* Avatar Circular con Iniciales */}
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
          <span className="text-white font-black text-xs">
            {user ? getInitials(user.nombre) : "??"}
          </span>
        </div>
      </div>
      
      {/* Botones de Acción Inferiores */}
      <div className="flex justify-center gap-6">
          <SidebarConfigMenu />
          <LogOut 
            onClick={logout} // Acción de cerrar sesión
            className="text-white/50 hover:text-yuriana-red cursor-pointer transition-colors" 
            size={22} 
          />
      </div>
    </div>
  );
};