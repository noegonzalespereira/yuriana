import { apiFetch } from "../api";
import { Colaborador, TipoColaborador } from "@/types/colaborador.types";

export interface ColaboradorFilters {
  ci?: string;
  ciudad?: string;
  tipo_colaborador?: TipoColaborador;
}

export const getColaboradores = async (filters: ColaboradorFilters = {}): Promise<Colaborador[]> => {
  const queryParams = new URLSearchParams();

  if (filters.ci?.trim()) queryParams.append("ci", filters.ci.trim());
  if (filters.ciudad?.trim()) queryParams.append("ciudad", filters.ciudad.trim());
  
  if (filters.tipo_colaborador === "ATA" || filters.tipo_colaborador === "DESPACHANTE") {
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