// src/components/molecules/AlertCard.tsx
"use client";
import { User, Truck } from "lucide-react";

export interface AlertData {
  id_documento: number;
  nombre_documento: string;
  // Propiedades dinámicas según la entidad
  entityId: string;       // CI o Placa
  entityName: string;     // Nombre del chofer o alias del camión
  dias_restantes?: number;
}

interface AlertCardProps {
  data: AlertData;
  type: "vencido" | "por_vencer";
  entityType: "conductor" | "unidad";
  onAction: (id: string) => void;
}

export const AlertCard = ({ data, type, entityType, onAction }: AlertCardProps) => {
  const isVencido = type === "vencido";

  return (
    <div className={`border p-4 rounded-2xl flex flex-col gap-3 transition-all hover:shadow-sm ${
      isVencido 
        ? "bg-red-100/90 border-red-200" 
        : "bg-amber-100/90 border-amber-200"
    }`}>
      
      {/* Encabezado de la tarjeta */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-wider ${
            isVencido ? "text-[var(--yuriana-base-red)]" : "text-amber-600"
          }`}>
            {isVencido ? "Documento Vencido" : `Por vencer ${data.dias_restantes ? `(en ${data.dias_restantes} días)` : ""}`}
          </span>
          <span className="font-bold text-[var(--yuriana-base-gray-dark)] text-sm mt-0.5">
            {data.nombre_documento}
          </span>
        </div>
        
        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
          isVencido 
            ? "bg-[var(--yuriana-base-red)] text-white" 
            : "bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)]"
        }`}>
          {isVencido ? "Vencido" : "Alerta"}
        </span>
      </div>

      {/* Información del dueño y botón de acción */}
      <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-1.5 max-w-[70%]">
          {entityType === "conductor" ? (
            <User size={14} className="text-gray-400 shrink-0" />
          ) : (
            <Truck size={14} className="text-gray-400 shrink-0" />
          )}
          <span className="truncate text-[var(--yuriana-base-gray-dark)]">
            {data.entityName}{" "}
            <span className="text-[10px] text-[var(--yuriana-base-gray-light)] font-medium">
              ({entityType === "conductor" ? "CI:" : "Placa:"} {data.entityId})
            </span>
          </span>
        </div>
        
        <button 
          onClick={() => onAction(data.entityId)} 
          className="bg-[var(--yuriana-base-yellow)] text-[var(--yuriana-base-black)] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Ver {entityType === "conductor" ? "Conductor" : "Unidad"}
        </button>
      </div>
    </div>
  );
};