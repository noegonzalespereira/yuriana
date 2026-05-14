interface SidebarLabelProps {
  label: string;
  active?: boolean;
}

export const SidebarLabel = ({ label, active }: SidebarLabelProps) => {
  return (
    <span className={`
      text-lg font-semibold transition-all duration-200
      ${active ? 'translate-x-1 text-white' : 'text-white/80 group-hover:text-white'}
    `}>
      {label}
    </span>
  );
};