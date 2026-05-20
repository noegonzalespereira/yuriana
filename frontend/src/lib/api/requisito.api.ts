
import { apiFetch } from "../api";
import { RequisitoDocumento, CategoriaEntidad } from "@/types/documento.types";

// Obtener todas las categorías registradas en el sistema
export const getCategorias = async (): Promise<CategoriaEntidad[]> => {
  return apiFetch("/categoria_entidad");
};

// CRUD de Requisitos de Documentos
export const getRequisitos = async (filters: { id_categoria?: number; nombre_documento?: string } = {}): Promise<RequisitoDocumento[]> => {
  const queryParams = new URLSearchParams();
  if (filters.id_categoria) queryParams.append("id_categoria", filters.id_categoria.toString());
  if (filters.nombre_documento?.trim()) queryParams.append("nombre_documento", filters.nombre_documento.trim());

  const queryString = queryParams.toString();
  return apiFetch(`/requisito-documento${queryString ? `?${queryString}` : ""}`);
};

export const createRequisito = async (data: any) => {
  return apiFetch("/requisito-documento", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateRequisito = async (id: number, data: any) => {
  return apiFetch(`/requisito-documento/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteRequisito = async (id: number) => {
  return apiFetch(`/requisito-documento/${id}`, {
    method: "DELETE",
  });
};