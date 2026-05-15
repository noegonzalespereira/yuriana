import { apiFetch } from "../api";

export interface Rol {
  id_rol: number;
  nombre: string;
}

export const getRoles = async (): Promise<Rol[]> => {
  return apiFetch("/rol");
};