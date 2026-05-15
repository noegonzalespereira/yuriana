import { Users, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "../atoms/StatCard";

interface UserStatsCardsProps {
  total: number;
  activos: number;
  inactivos: number;
}

export const UserStatsCards = ({ total, activos, inactivos }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <StatCard 
        label="Total Usuarios" 
        value={total} 
        icon={<Users size={24} />} 
        borderColor="border-gray-200" 
        iconBg="bg-orange-50" 
        iconColor="text-orange-500" 
      />
      <StatCard 
        label="Activos" 
        value={activos} 
        icon={<CheckCircle size={24} />} 
        borderColor="border-green-400" 
        iconBg="bg-green-50" 
        iconColor="text-green-600" 
      />
      <StatCard 
        label="Inactivos" 
        value={inactivos} 
        icon={<XCircle size={24} />} 
        borderColor="border-red-400" 
        iconBg="bg-red-50" 
        iconColor="text-red-600" 
      />
    </div>
  );
};