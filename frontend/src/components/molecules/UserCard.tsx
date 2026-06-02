"use client";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SidebarConfigMenu } from "../atoms/SidebarConfigMenu";

export const UserCard = () => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Contenedor de Información del Usuario */}
      <div className="bg-black/20 p-4 rounded-2xl flex items-center justify-between shadow-inner border border-white/5">
        <div className="flex flex-col max-w-[120px]">
          <span className="text-white font-bold text-sm truncate leading-tight">
            {user?.nombre || "Cargando..."}
          </span>
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-tighter mt-0.5">
            {user?.rol || "Usuario"}
          </span>
        </div>
        
        {/* Avatar */}
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-sm">
          <span className="text-white font-black text-xs tracking-tighter">
            {user ? getInitials(user.nombre) : "??"}
          </span>
        </div>
      </div>
      
      {/* Botones de Configuración y Cierre de Sesión */}
      <div className="flex justify-center gap-6 items-center">
        <SidebarConfigMenu />
        <button 
          onClick={logout}
          className="text-white/50 hover:text-[var(--yuriana-base-red)] transition-colors outline-none cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
};