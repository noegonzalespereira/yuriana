"use client";
import { DynamicLogo } from "@/components/molecules/DynamicLogo";
import { SidebarLink } from "@/components/molecules/SidebarLink";
import { UserCard } from "@/components/molecules/UserCard";
import {
  LayoutDashboard,
  Truck,
  Users,
  UserCircle,
  Handshake,
  Map,
  ClipboardCheck,
  TrendingUp,
  Receipt,
  FileCheck
} from "lucide-react";

const menuOptions = [
  { icon: <LayoutDashboard size={24} />, label: "Dashboard", href: "/dashboard" },
  { icon: <Truck size={24} />, label: "Unidades", href: "/unidades" },
  { icon: <Users size={24} />, label: "Clientes", href: "/clientes" },
  { icon: <UserCircle size={24} />, label: "Conductores", href: "/conductores" },
  { icon: <Handshake size={24} />, label: "Colaboradores", href: "/colaboradores" },
  { icon: <Map size={24} />, label: "Viajes", href: "/viajes" },
  { icon: <ClipboardCheck size={24} />, label: "Asignaciones", href: "/asignaciones" },
  { icon: <TrendingUp size={24} />, label: "Ingresos", href: "/ingresos" },
  { icon: <Receipt size={24} />, label: "Gastos", href: "/gastos" },
  { icon: <FileCheck size={24} />, label: "Facturación", href: "/facturacion" },
];

export const Sidebar = () => {
  return (
    <aside className="w-72 bg-[var(--yuriana-sidebar-bg)] min-h-screen flex flex-col shadow-2xl relative z-50">
      {/* Contenedor del Logo */}
      <div className="py-10 flex justify-center">
        <DynamicLogo size={150} />
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 pl-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {menuOptions.map((option) => (
          <SidebarLink 
            key={option.href}
            icon={option.icon}
            label={option.label}
            href={option.href}
          />
        ))}
      </nav>

      {/* Sección de Usuario Inferior */}
      <div className="p-4 border-t border-white/10">
        <UserCard />
      </div>
    </aside>
  );
};