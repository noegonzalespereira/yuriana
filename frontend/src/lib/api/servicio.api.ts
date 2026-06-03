import { apiFetch } from "../api";
import { ServicioResumen } from "@/types/gasto.types";

export const getServicios = async (buscar?: string): Promise<ServicioResumen[]> => {
  const q = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
  return apiFetch(`/servicio${q}`);
};

export const getServicio = async (id: number): Promise<ServicioResumen> => {
  return apiFetch(`/servicio/${id}`);
};
