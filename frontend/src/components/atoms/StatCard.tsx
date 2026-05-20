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
    <div className={`bg-[var(--yuriana-card-bg)] p-6 rounded-3xl border-2 ${borderColor} shadow-sm flex flex-col gap-2 w-full transition-transform hover:scale-[1.02]`}>
      <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div className="flex flex-col mt-2">
        <span className="text-[var(--yuriana-base-gray-light)] text-sm font-semibold">{label}</span>
        <span className="text-3xl font-black text-[var(--yuriana-base-gray-dark)]">{value}</span>
      </div>
    </div>
  );
};