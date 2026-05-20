// src/components/organisms/UserStatsCards.tsx
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
        borderColor="border-[var(--yuriana-card-border)]" 
        iconBg="bg-orange-50" 
        iconColor="text-[var(--yuriana-base-orange)]" 
      />
      <StatCard 
        label="Activos" 
        value={activos} 
        icon={<CheckCircle size={24} />} 
        borderColor="border-emerald-200" 
        iconBg="bg-emerald-50" 
        iconColor="text-emerald-600" 
      />
      <StatCard 
        label="Inactivos" 
        value={inactivos} 
        icon={<XCircle size={24} />} 
        borderColor="border-red-200" 
        iconBg="bg-red-50" 
        iconColor="text-[var(--yuriana-input-error)]" 
      />
    </div>
  );
};