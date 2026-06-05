import { apiFetch } from "../api";
import { IngresoExtra, TotalesIngresos } from "@/types/ingreso.types";

export const getTotalesIngresos = async (): Promise<TotalesIngresos> => {
  return apiFetch("/ingreso-extra/totales");
};

export const getIngresosExtra = async (filters: { fecha_inicio?: string; fecha_fin?: string } = {}): Promise<IngresoExtra[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  const q = params.toString();
  return apiFetch(`/ingreso-extra${q ? `?${q}` : ""}`);
};

export const getDetalleIngresoExtra = async (id: number): Promise<IngresoExtra> => {
  return apiFetch(`/ingreso-extra/${id}`);
};

export const crearIngresoExtra = async (data: {
  fecha: string;
  descripcion: string;
  monto: number;
}): Promise<IngresoExtra> => {
  return apiFetch("/ingreso-extra", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const editarIngresoExtra = async (id: number, data: {
  fecha?: string;
  descripcion?: string;
  monto?: number;
}): Promise<IngresoExtra> => {
  return apiFetch(`/ingreso-extra/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const eliminarIngresoExtra = async (id: number): Promise<any> => {
  return apiFetch(`/ingreso-extra/${id}`, { method: "DELETE" });
};
