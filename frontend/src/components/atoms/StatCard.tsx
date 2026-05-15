import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  borderColor: string; // Ejemplo: "border-green-500" o "border-red-500"
  iconBg: string;      // Ejemplo: "bg-green-100"
  iconColor: string;   // Ejemplo: "text-green-600"
}

export const StatCard = ({ icon, label, value, borderColor, iconBg, iconColor }: StatCardProps) => {
  return (
    <div className={`bg-white p-6 rounded-3xl border-2 ${borderColor} shadow-sm flex flex-col gap-2 w-full transition-transform hover:scale-[1.02]`}>
      <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div className="flex flex-col mt-2">
        <span className="text-gray-500 text-sm font-semibold">{label}</span>
        <span className="text-3xl font-black text-gray-900">{value}</span>
      </div>
    </div>
  );
};