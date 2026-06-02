"use client";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { AlertCard, AlertData } from "../molecules/AlertCard";

interface ModuleAlertsPanelProps {
  vencidos: AlertData[];
  porVencer: AlertData[];
  entityType: "conductor" | "unidad";
  onAction: (id: string) => void;
}

export const ModuleAlertsPanel = ({ vencidos, porVencer, entityType, onAction }: ModuleAlertsPanelProps) => {
  const entityLabel = entityType === "conductor" ? "Conductores" : "Unidades";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* COLUMNA ROJA: VENCIDOS */}
      <div className="bg-[var(--yuriana-base-white)] p-6 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between text-[var(--yuriana-base-red)] border-b border-red-500 pb-3">
          <h3 className="font-black text-sm uppercase tracking-tight">
            Documentación Vencida ({entityLabel})
          </h3>
          <ShieldAlert size={22} className={vencidos.length > 0 ? "animate-pulse" : ""} />
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {vencidos.length === 0 ? (
            <p className="text-[var(--yuriana-input-placeholder)] text-xs italic text-center py-8">
              No se encontraron documentos vencidos.
            </p>
          ) : (
            vencidos.map((doc) => (
              <AlertCard 
                key={doc.id_documento}
                data={doc}
                type="vencido"
                entityType={entityType}
                onAction={onAction}
              />
            ))
          )}
        </div>
      </div>

      {/* COLUMNA AMARILLA: POR VENCER */}
      <div className="bg-[var(--yuriana-base-white)] p-6 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between text-[var(--yuriana-base-yellow)] border-b border-amber-500 pb-3">
          <h3 className="font-black text-sm uppercase tracking-tight">
            Documentación Por Vencer ({entityLabel})
          </h3>
          <AlertTriangle size={22} />
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {porVencer.length === 0 ? (
            <p className="text-[var(--yuriana-input-placeholder)] text-xs italic text-center py-8">
              No se encontraron documentos por vencer.
            </p>
          ) : (
            porVencer.map((doc) => (
              <AlertCard 
                key={doc.id_documento}
                data={doc}
                type="por_vencer"
                entityType={entityType}
                onAction={onAction}
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
};