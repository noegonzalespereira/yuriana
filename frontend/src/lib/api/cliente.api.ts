import { apiFetch } from "../api";
import { Cliente } from "@/types/cliente.types";

export interface ClienteFilters {
  buscar?: string;
  nombre?: string;
  codigo_cliente?: string;
  ci?: number;
}

export const getClientes = async (filters: ClienteFilters = {}): Promise<Cliente[]> => {
  const queryParams = new URLSearchParams();

  if (filters.buscar && filters.buscar.trim() !== "") {
    queryParams.append("buscar", filters.buscar.trim());
  }
  if (filters.codigo_cliente && filters.codigo_cliente.trim() !== "") {
    queryParams.append("codigo_cliente", filters.codigo_cliente.trim());
  }
  if (filters.nombre && filters.nombre.trim() !== "") {
    queryParams.append("nombre", filters.nombre.trim());
  }

  const queryString = queryParams.toString();
  return apiFetch(`/cliente${queryString ? `?${queryString}` : ""}`);
};

export const createCliente = async (data: any) => {
  return apiFetch("/cliente", { method: "POST", body: JSON.stringify(data) });
};

export const updateCliente = async (codigo: string, data: any) => {
  return apiFetch(`/cliente/${codigo}`, { method: "PATCH", body: JSON.stringify(data) });
};

export const deleteCliente = async (codigo: string) => {
  return apiFetch(`/cliente/${codigo}`, { method: "DELETE" });
};
