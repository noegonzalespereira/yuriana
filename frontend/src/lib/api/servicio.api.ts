import { apiFetch } from "../api";
import { ServicioResumen } from "@/types/gasto.types";
import { ServicioItem, ContadoresServicio, FiltersServicio } from "@/types/servicio.types";

export const getServicios = async (filters?: FiltersServicio): Promise<ServicioItem[]> => {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.buscar?.trim())       params.append("buscar",          filters.buscar.trim());
    if (filters.operador)             params.append("operador",         filters.operador);
    if (filters.estado_pago)          params.append("estado_pago",      filters.estado_pago);
    if (filters.estado_servicio)      params.append("estado_servicio",  filters.estado_servicio);
    if (filters.fecha_inicio)         params.append("fecha_inicio",     filters.fecha_inicio);
    if (filters.fecha_fin)            params.append("fecha_fin",        filters.fecha_fin);
    if (filters.id_categoria)         params.append("id_categoria",     String(filters.id_categoria));
    if (filters.facturado)            params.append("facturado",        filters.facturado);
  }
  const q = params.toString();
  return apiFetch(`/servicio${q ? `?${q}` : ""}`);
};

export const getServicio = async (id: number): Promise<ServicioResumen> => {
  return apiFetch(`/servicio/${id}`);
};

export const getServicioDetalle = async (id: number): Promise<ServicioItem> => {
  return apiFetch(`/servicio/${id}`);
};

export const getContadoresServicio = async (filters: { fecha_inicio?: string, fecha_fin?: string }): Promise<ContadoresServicio> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  const q = params.toString();
  return apiFetch(`/servicio/contadores${q ? `?${q}` : ""}`);
};

export const crearServicio = async (formData: FormData): Promise<ServicioItem> => {
  return apiFetch("/servicio", { method: "POST", body: formData });
};

export const editarServicio = async (id: number, formData: FormData): Promise<ServicioItem> => {
  return apiFetch(`/servicio/${id}`, { method: "PATCH", body: formData });
};

export const eliminarServicio = async (id: number): Promise<any> => {
  return apiFetch(`/servicio/${id}`, { method: "DELETE" });
};
