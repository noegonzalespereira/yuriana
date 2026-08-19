import { Persona } from "./colaborador.types"; // Importación directa de la fuente
export enum EstadoOperativo {
  DISPONIBLE = 'DISPONIBLE',
  ASIGNADO = 'ASIGNADO',
  VIAJE = 'EN VIAJE',
}

export enum EstadoLaboral {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export interface Conductor {
  id_conductor: number;
  id_persona: number;
  id_categoria: number;
  sueldo?: number;
  estado_operativo: EstadoOperativo;
  estado_laboral: EstadoLaboral;
  persona: Omit<Persona, 'ci'> & { ci: string };
  
  // Propiedades enriquecidas por el backend (getEstadoDocumentosPorEntidad)
  estado?: 'vigente' | 'por_vencer' | 'vencido' | 'sin_documentos';
  documento_critico?: string | null;
  dias_restantes?: number | null;
}

export interface ConductorStats {
  total: number;
  activos: number;
  inactivos: number;
}