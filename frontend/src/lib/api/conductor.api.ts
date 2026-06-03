import { apiFetch } from "../api";
import { Conductor, ConductorStats } from "@/types/conductor.types";

export interface ConductorFilters {
  nombre?: string;
  estado_laboral?: string;
  estado_operativo?: string;
  estado_documentos?: string;
}

export const getConductores = async (filters: ConductorFilters = {}): Promise<Conductor[]> => {
  const queryParams = new URLSearchParams();
  if (filters.nombre?.trim()) {
    const val = filters.nombre.trim();
    if (!isNaN(Number(val))) queryParams.append("ci", val);
    else queryParams.append("nombre", val);
  }
  if (filters.estado_laboral) queryParams.append("estado_laboral", filters.estado_laboral);
  if (filters.estado_operativo) queryParams.append("estado_operativo", filters.estado_operativo);
  if (filters.estado_documentos) queryParams.append("estado_documentos", filters.estado_documentos);

  const queryString = queryParams.toString();
  return apiFetch(`/conductor${queryString ? `?${queryString}` : ""}`);
};

export const getConductorContador = async (): Promise<ConductorStats> => {
  return apiFetch("/conductor/contador");
};

export const getDocumentosVencidos = async (): Promise<any[]> => {
  return apiFetch("/documento/alertas/vencidos");
};

export const getDocumentosPorVencer = async (): Promise<any[]> => {
  return apiFetch("/documento/alertas/por-vencer");
};

// ENDPOINTS DEL MULTIPART PARA ENVIAR ARCHIVOS FISICOS AL CONTROLLER DE NESTJS
export const uploadDocumentoConductor = async (formData: FormData): Promise<any> => {
  return apiFetch("/documento", {
    method: "POST",
    // Al usar FormData con archivos, NO se debe definir el body con JSON.stringify
    body: formData,
  });
};

export const getDocumentosDeEntidad = async (idConductor: number): Promise<any[]> => {
  return apiFetch(`/documento?id_conductor=${idConductor}`);
};

export const registrarConductor = async (formData: FormData): Promise<any> => {
  return apiFetch("/conductor/registrar", { method: "POST", body: formData });
};

export const createConductor = async (data: any) => {
  return apiFetch("/conductor", { method: "POST", body: JSON.stringify(data) });
};

export const updateConductor = async (ci: number, data: any) => {
  return apiFetch(`/conductor/${ci}`, { method: "PATCH", body: JSON.stringify(data) });
};

export const deleteConductor = async (ci: number) => {
  return apiFetch(`/conductor/${ci}`, { method: "DELETE" });
};