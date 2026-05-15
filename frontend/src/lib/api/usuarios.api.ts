import { apiFetch } from "../api";
import { User } from "@/types/auth.types";

export interface UserFilters {
  nombre?: string;
  estado?: string;
  rol?: string;
}

export const getUsuarios = async (filters: UserFilters = {}): Promise<User[]> => {
  const params = new URLSearchParams();
  if (filters.nombre) params.append("nombre", filters.nombre);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.rol) params.append("rol", filters.rol);

  return apiFetch(`/usuario?${params.toString()}`);
};

export const getUsuarioById = async (id: number): Promise<User> => {
  return apiFetch(`/usuario/${id}`);
};

export const createUsuario = async (data: any) => {
  return apiFetch("/usuario", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUsuario = async (id: number, data: any) => {
  return apiFetch(`/usuario/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteUsuario = async (id: number) => {
  return apiFetch(`/usuario/${id}`, { method: "DELETE" });
};

export const getUsuariosContador = async () => {
  return apiFetch(`/usuario/contador`);
};