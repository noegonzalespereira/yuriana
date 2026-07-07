import { apiFetch } from "../api";
import { Colaborador, TipoColaborador } from "@/types/colaborador.types";

export interface ColaboradorFilters {
  nombre?: string;
  ciudad?: string;
  tipo_colaborador?: TipoColaborador;
}

export const getColaboradores = async (filters: ColaboradorFilters = {}): Promise<Colaborador[]> => {
  const queryParams = new URLSearchParams();

  if (filters.nombre?.trim()) queryParams.append("nombre", filters.nombre.trim());
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

export const updateColaborador = async (id: number, data: any) => {
  return apiFetch(`/colaborador/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
};

export const deleteColaborador = async (id: number) => {
  return apiFetch(`/colaborador/${id}`, { method: "DELETE" });
};