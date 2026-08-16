import { apiFetch } from "../api";
import { IngresoExtra, TotalesIngreso, IngresoFilters } from "@/types/ingreso-extra.types";

export const getTotalesIngreso = async (filters: Partial<IngresoFilters> = {}): Promise<TotalesIngreso> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  const q = params.toString();
  return apiFetch(`/ingreso-extra/totales${q ? `?${q}` : ""}`);
};

export const getIngresos = async (filters: IngresoFilters = {}): Promise<IngresoExtra[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar) params.append("buscar", filters.buscar);
  const q = params.toString();
  return apiFetch(`/ingreso-extra${q ? `?${q}` : ""}`);
};

export const getDetalleIngreso = async (id: number): Promise<IngresoExtra> => {
  return apiFetch(`/ingreso-extra/${id}`);
};

export const crearIngreso = async (data: {
  fecha: string;
  descripcion: string;
  monto: number;
}): Promise<IngresoExtra> => {
  return apiFetch("/ingreso-extra", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const editarIngreso = async (
  id: number,
  data: { fecha?: string; descripcion?: string; monto?: number }
): Promise<IngresoExtra> => {
  return apiFetch(`/ingreso-extra/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const eliminarIngreso = async (id: number): Promise<any> => {
  return apiFetch(`/ingreso-extra/${id}`, { method: "DELETE" });
};
