import { apiFetch } from "../api";
import { Colaborador, TipoColaborador } from "@/types/colaborador.types";

export interface ColaboradorFilters {
  nombre?: string;
  ciudad?: string;
  tipo_colaborador?: TipoColaborador;
}

// src/lib/api/colaborador.api.ts

export const getColaboradores = async (filters: ColaboradorFilters = {}): Promise<Colaborador[]> => {
  const queryParams = new URLSearchParams();

  // Solo agregamos al query lo que realmente tenga un valor válido
  if (filters.nombre?.trim()) queryParams.append("nombre", filters.nombre);
  if (filters.ciudad?.trim()) queryParams.append("ciudad", filters.ciudad);
  
  if (filters.tipo_colaborador === "ata" || filters.tipo_colaborador === "despachante") {
    queryParams.append("tipo_colaborador", filters.tipo_colaborador);
  }

  const queryString = queryParams.toString();
  return apiFetch(`/colaborador${queryString ? `?${queryString}` : ""}`);
};

export const createColaborador = async (data: any) => {
  return apiFetch("/colaborador", { method: "POST", body: JSON.stringify(data) });
};

export const updateColaborador = async (ci: number, data: any) => {
  return apiFetch(`/colaborador/${ci}`, { 
    method: "PATCH", 
    body: JSON.stringify(data) 
  });
};

export const deleteColaborador = async (ci: number) => {
  return apiFetch(`/colaborador/${ci}`, { method: "DELETE" });
};