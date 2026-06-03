import { apiFetch } from "../api";
import { GastosServicio, TotalesPaneles, TipoPestana } from "@/types/gasto.types";

export interface GastoFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
  tipo_gasto?: string;
}

export const getTotalesPaneles = async (): Promise<TotalesPaneles> => {
  return apiFetch("/gastos/totales-paneles");
};

export const getGastosServicio = async (filters: GastoFilters = {}): Promise<GastosServicio[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar?.trim()) params.append("buscar", filters.buscar.trim());
  const q = params.toString();
  return apiFetch(`/gastos/listado/servicio${q ? `?${q}` : ""}`);
};

export const getDetalleGastoServicio = async (id: number): Promise<GastosServicio> => {
  return apiFetch(`/gastos/detalle/servicio/${id}`);
};

export const guardarGastoServicio = async (data: {
  tipo_pestaña: string;
  codigo_servicio: string;
  moneda: string;
  tipo_cambio: number;
  viatico_entregado: number;
  items: { fecha: string; tipo_gasto: string; descripcion: string; monto: number }[];
}): Promise<any> => {
  return apiFetch("/gastos/guardar-pantalla", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const eliminarGastoServicio = async (id: number): Promise<any> => {
  return apiFetch(`/gastos/eliminar/${TipoPestana.SERVICIO}/${id}`, { method: "DELETE" });
};

export const editarGastoServicio = async (id: number, data: any): Promise<any> => {
  return apiFetch(`/gastos/editar/${TipoPestana.SERVICIO}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
