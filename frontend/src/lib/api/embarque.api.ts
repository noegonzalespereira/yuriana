import { apiFetch } from "../api";
import type { Embarque } from "@/types/servicio.types";

export const getEmbarquesDisponibles = (buscar?: string): Promise<Embarque[]> => {
  const query = buscar?.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : "";
  return apiFetch(`/embarque/disponibles${query}`);
};

export const crearEmbarque = (data: { crt: string; total_unidades: number }): Promise<Embarque> =>
  apiFetch("/embarque", { method: "POST", body: JSON.stringify(data) });

export interface EmbarqueGestion extends Embarque {
  servicios_count: number;
}

export const getEmbarques = (buscar?: string): Promise<EmbarqueGestion[]> => {
  const query = buscar?.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : "";
  return apiFetch(`/embarque${query}`);
};

export const actualizarEmbarque = (
  id: number,
  data: { crt?: string; total_unidades?: number },
): Promise<Embarque> =>
  apiFetch(`/embarque/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const eliminarEmbarque = (id: number) =>
  apiFetch(`/embarque/${id}`, { method: "DELETE" });
