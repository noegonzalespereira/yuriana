import { apiFetch } from "../api";
import { ResponseAsignacion, Asignacion } from "@/types/asignacion.types";
import { Conductor } from "@/types/conductor.types";
import { Unidad } from "@/types/unidad.types";

export interface AsignacionFilters {
  estado_asignacion?: string;
  ci_conductor?: string;
  placa_tracto?: string;
  placa_remolque?: string;
}

export const getAsignaciones = async (filters: AsignacionFilters = {}): Promise<Asignacion[]> => {
  const queryParams = new URLSearchParams();
  if (filters.estado_asignacion) queryParams.append("estado_asignacion", filters.estado_asignacion);
  if (filters.ci_conductor?.trim()) queryParams.append("ci_conductor", filters.ci_conductor.trim());
  if (filters.placa_tracto?.trim()) queryParams.append("placa_tracto", filters.placa_tracto.trim().toUpperCase());
  if (filters.placa_remolque?.trim()) queryParams.append("placa_remolque", filters.placa_remolque.trim().toUpperCase());

  const queryString = queryParams.toString();
  return apiFetch(`/asignacion${queryString ? `?${queryString}` : ""}`);
};

// Consultas dinámicas para poblar el asistente por pasos del enganche
export const getConductoresDisponibles = async (): Promise<Conductor[]> => {
  return apiFetch("/conductor?estado_operativo=DISPONIBLE&estado_laboral=ACTIVO");
};

export const getUnidadesDisponibles = async (id_categoria?: number): Promise<Unidad[]> => {
  const query = id_categoria ? `?id_categoria=${id_categoria}` : "";
  return apiFetch(`/unidad${query}`);
};

export const createAsignacion = async (data: { ci_conductor: number; placa_tracto: string; placa_remolque: string }): Promise<ResponseAsignacion> => {
  return apiFetch("/asignacion", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const desengancharUnidad = async (idAsignacion: number): Promise<{ mensaje: string }> => {
  return apiFetch(`/asignacion/${idAsignacion}`, {
    method: "DELETE",
  });
};