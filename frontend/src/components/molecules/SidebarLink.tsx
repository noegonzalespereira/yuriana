import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarIcon } from "../atoms/SidebarIcon";
import { SidebarLabel } from "../atoms/SidebarLabel";

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export const SidebarLink = ({ icon, label, href }: SidebarLinkProps) => {
  const pathname = usePathname();
  // Verificamos si la ruta actual coincide con el link para iluminarlo
  const active = pathname === href;

  return (
    <Link 
      href={href} 
      className={`
        group flex items-center gap-4 px-4 py-3 rounded-l-full transition-all duration-300
        ${active 
          ? 'bg-white/10 border-r-4 border-yuriana-yellow text-white shadow-md' 
          : 'text-white/70 hover:bg-white/5 hover:text-white'
        }
      `}
    >
      <SidebarIcon active={active}>
        {icon}
      </SidebarIcon>
      
      <SidebarLabel label={label} active={active} />
    </Link>
  );
};