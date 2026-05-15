// src/components/atoms/SidebarConfigMenu.tsx
import Link from "next/link";
import { useState } from "react";
import { Settings } from "lucide-react";

export const SidebarConfigMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Documentos", href: "/configuracion/documentos" },
    { label: "Empresa", href: "/configuracion/empresa" },
    { label: "Usuarios", href: "/usuarios" }, // <--- Ruta al módulo
  ];

  return (
    <div className="relative">
      {/* El menú flotante que aparece arriba del engranaje */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-40 bg-gray-300 rounded-xl overflow-hidden shadow-2xl flex flex-col z-[60]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-yuriana-orange/20 hover:text-yuriana-orange border-b border-gray-400/20 last:border-none transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* El botón del engranaje */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-all duration-300 ${isOpen ? 'text-white rotate-90' : 'text-white/50 hover:text-white'}`}
      >
        <Settings size={24} />
      </button>
    </div>
  );
};