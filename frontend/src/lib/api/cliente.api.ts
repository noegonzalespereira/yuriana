import { apiFetch } from "../api";
import { Cliente } from "@/types/cliente.types";

export interface ClienteFilters {
  nombre?: string;
  codigo_cliente?: string;
  ci?: number;
}

// src/lib/api/cliente.api.ts

export const getClientes = async (filters: ClienteFilters = {}): Promise<Cliente[]> => {
  const queryParams = new URLSearchParams();

  

  // 2. Filtro por Código de Cliente CRÍTICO: 
  // Solo lo agregamos si tiene texto. Si viene "" (vacío), NO se añade al query.
  if (filters.codigo_cliente && filters.codigo_cliente.trim() !== "") {
    queryParams.append("codigo_cliente", filters.codigo_cliente.trim());
  }

  

  const queryString = queryParams.toString();
  
  // Imprimimos en la consola del navegador para verificar qué URL exacta se genera
  console.log("Petición GET a clientes ejecutada con URL:", `/cliente${queryString ? `?${queryString}` : ""}`);
  
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