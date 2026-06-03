import { apiFetch } from "../api";
import { Unidad } from "@/types/unidad.types";

export interface UnidadFilters {
  estado_unidad?: string;
  id_categoria?: string;
  placa?: string;
  estado_documentos?: string;
}

// Consumo del listado de unidades con parámetros de filtro
export const getUnidades = async (filters: UnidadFilters = {}): Promise<Unidad[]> => {
  const queryParams = new URLSearchParams();
  if (filters.estado_unidad) queryParams.append("estado_unidad", filters.estado_unidad);
  if (filters.id_categoria) queryParams.append("id_categoria", filters.id_categoria);
  if (filters.placa?.trim()) queryParams.append("placa", filters.placa.trim());
  if (filters.estado_documentos) queryParams.append("estado_documentos", filters.estado_documentos);

  const queryString = queryParams.toString();
  return apiFetch(`/unidad${queryString ? `?${queryString}` : ""}`);
};

// Obtener los tipos de transporte (Tracto, Semiremolque, Remolque) usando la ruta /categoria_entidad de tu controller
export const getCategoriasEntidad = async (): Promise<any[]> => {
  return apiFetch("/categoria_entidad");
};

export const registrarUnidad = async (formData: FormData): Promise<Unidad> => {
  return apiFetch("/unidad/registrar", { method: "POST", body: formData });
};

export const uploadDocumentoUnidad = async (formData: FormData): Promise<any> => {
  return apiFetch("/documento", { method: "POST", body: formData });
};

export const createUnidad = async (formData: FormData): Promise<Unidad> => {
  return apiFetch("/unidad", {
    method: "POST",
    body: formData,
  });
};

export const updateUnidad = async (placa: string, formData: FormData): Promise<Unidad> => {
  return apiFetch(`/unidad/${placa.toUpperCase()}`, {
    method: "PATCH",
    body: formData, // ← siempre FormData, Multer puede parsearlo
  });
};

export const deleteUnidad = async (placa: string): Promise<any> => {
  return apiFetch(`/unidad/${placa.toUpperCase()}`, {
    method: "DELETE",
  });
};

// Reutilización polimórfica para consultar el histórico documental de la unidad
export const getDocumentosDeUnidad = async (idUnidad: number): Promise<any[]> => {
  return apiFetch(`/documento?id_unidad=${idUnidad}`);
};