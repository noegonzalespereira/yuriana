interface SidebarLabelProps {
  label: string;
  active?: boolean;
}

export const SidebarLabel = ({ label, active }: SidebarLabelProps) => {
  return (
    <span className={`
      text-xs font-bold transition-all duration-200 uppercase tracking-tight
      ${active ? 'translate-x-1 text-white' : 'text-white/80 group-hover:text-white'}
    `}>
      {label}
    </span>
  );
};