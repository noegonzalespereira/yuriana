import { ReactNode } from "react";

interface SidebarIconProps {
  children: ReactNode;
  active?: boolean;
}

export const SidebarIcon = ({ children, active }: SidebarIconProps) => {
  return (
    <div className={`
      transition-colors duration-200
      ${active ? 'text-white scale-110' : 'text-white/70 group-hover:text-white'}
    `}>
      {/* Clonamos el icono para pasarle props estándar de tamaño */}
      {children}
    </div>
  );
};