import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  borderColor: string; 
  iconBg: string;      
  iconColor: string;   
}

export const StatCard = ({ icon, label, value, borderColor, iconBg, iconColor }: StatCardProps) => {
  return (
    <div className={`bg-[var(--yuriana-card-bg)] p-4 rounded-3xl border-2 ${borderColor} shadow-sm flex flex-col gap-1.5 w-full transition-transform hover:scale-[1.02]`}>
      <div className={`w-9 h-9 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div className="flex flex-col mt-1">
        <span className="text-[var(--yuriana-base-gray-light)] text-xs font-semibold">{label}</span>
        <span className="text-xl font-black text-[var(--yuriana-base-gray-dark)]">{value}</span>
      </div>
    </div>
  );
};