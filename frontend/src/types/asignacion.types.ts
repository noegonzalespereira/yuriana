import { Conductor } from "./conductor.types"; // Asegura que use tus types existentes
import { Unidad } from "./unidad.types";

export enum EstadoAsignacion {
  ACTIVA = 'activo',
  ASIGNADO = 'asignado',
}

export interface AlertaDocumental {
  entidad: 'conductor' | 'tracto' | 'remolque';
  nombre: string;
  documento: string;
  estado: 'vencido' | 'por_vencer';
  mensaje: string;
}

export interface Asignacion {
  id_asignacion: number;
  id_conductor: number;
  conductor: Conductor;
  id_tracto: number;
  tracto: Unidad;
  id_remolque: number;
  remolque: Unidad;
  estado_asignacion: EstadoAsignacion;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

export interface ResponseAsignacion {
  asignacion: Asignacion;
  alertas: AlertaDocumental[];
}