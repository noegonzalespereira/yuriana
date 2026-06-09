import Link from "next/link";
import { useState } from "react";
import { Settings } from "lucide-react";

export const SidebarConfigMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Documentos", href: "/configuracion/documentos" },
    { label: "Empresa", href: "/configuracion/empresa" },
    { label: "Usuarios", href: "/configuracion/usuarios" }, 
  ];

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-44 bg-[var(--yuriana-base-yellow)] rounded-xl overflow-hidden shadow-2xl flex flex-col z-[60]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 text-xs font-black text-[var(--yuriana-base-black)] uppercase tracking-wide hover:bg-black/10 border-b border-black/10 last:border-none transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-all duration-300 ${isOpen ? 'text-white rotate-90' : 'text-white/50 hover:text-white'}`}
      >
        <Settings size={24} />
      </button>
    </div>
  );
};