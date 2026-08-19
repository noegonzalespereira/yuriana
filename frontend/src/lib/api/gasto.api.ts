import { apiFetch } from "../api";
import { type GastoOperativo, type GastoAdministrativo, type GastoGeneral, GastosServicio, TotalesPaneles, TipoPestana } from "@/types/gasto.types";

export interface GastoFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
  tipo_gasto?: string;
}

export const getTotalesPaneles = async (filters: GastoFilters = {}): Promise<TotalesPaneles> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar?.trim()) params.append("buscar", filters.buscar.trim());
  if (filters.tipo_gasto?.trim()) params.append("tipo_gasto", filters.tipo_gasto.trim());
  const q = params.toString();
  return apiFetch(`/gastos/totales-paneles${q ? `?${q}` : ""}`);
};

export const getGastosServicio = async (filters: GastoFilters = {}): Promise<GastosServicio[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar?.trim()) params.append("buscar", filters.buscar.trim());
  const q = params.toString();
  return apiFetch(`/gastos/listado/${TipoPestana.SERVICIO}${q ? `?${q}` : ""}`);
};

export const getDetalleGastoServicio = async (id: number): Promise<GastosServicio> => {
  return apiFetch(`/gastos/detalle/${TipoPestana.SERVICIO}/${id}`);
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

// ── Gastos Operativos ──────────────────────────────────────────────────────

export const getGastosOperativos = async (filters: GastoFilters = {}): Promise<GastoOperativo[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar?.trim()) params.append("buscar", filters.buscar.trim());
  if (filters.tipo_gasto?.trim()) params.append("tipo_gasto", filters.tipo_gasto.trim());
  const q = params.toString();
  return apiFetch(`/gastos/listado/${TipoPestana.OPERATIVO}${q ? `?${q}` : ""}`);
};

export const getDetalleGastoOperativo = async (id: number): Promise<GastoOperativo> => {
  return apiFetch(`/gastos/detalle/${TipoPestana.OPERATIVO}/${id}`);
};

export const guardarGastoOperativo = async (data: {
  tipo_pestaña: string;
  placa: string;
  items: { fecha: string; tipo_gasto: string; descripcion: string; monto: number }[];
}): Promise<any> => {
  return apiFetch("/gastos/guardar-pantalla", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const editarGastoOperativo = async (id: number, data: any): Promise<any> => {
  return apiFetch(`/gastos/editar/${TipoPestana.OPERATIVO}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const eliminarGastoOperativo = async (id: number): Promise<any> => {
  return apiFetch(`/gastos/eliminar/${TipoPestana.OPERATIVO}/${id}`, { method: "DELETE" });
};

// ── Gastos Administrativos ─────────────────────────────────────────────────

export const getGastosAdministrativos = async (filters: GastoFilters = {}): Promise<GastoAdministrativo[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar?.trim()) params.append("buscar", filters.buscar.trim());
  if (filters.tipo_gasto?.trim()) params.append("tipo_gasto", filters.tipo_gasto.trim());
  const q = params.toString();
  return apiFetch(`/gastos/listado/${TipoPestana.ADMINISTRATIVO}${q ? `?${q}` : ""}`);
};

export const getDetalleGastoAdministrativo = async (id: number): Promise<GastoAdministrativo> => {
  return apiFetch(`/gastos/detalle/${TipoPestana.ADMINISTRATIVO}/${id}`);
};

export const guardarGastoAdministrativo = async (data: {
  tipo_pestaña: string;
  items: { fecha: string; tipo_gasto: string; descripcion: string; monto: number }[];
}): Promise<any> => {
  return apiFetch("/gastos/guardar-pantalla", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const editarGastoAdministrativo = async (id: number, data: any): Promise<any> => {
  return apiFetch(`/gastos/editar/${TipoPestana.ADMINISTRATIVO}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const eliminarGastoAdministrativo = async (id: number): Promise<any> => {
  return apiFetch(`/gastos/eliminar/${TipoPestana.ADMINISTRATIVO}/${id}`, { method: "DELETE" });
};

// ── Gastos Generales ───────────────────────────────────────────────────────

export const getGastosGenerales = async (filters: GastoFilters = {}): Promise<GastoGeneral[]> => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.buscar?.trim()) params.append("buscar", filters.buscar.trim());
  if (filters.tipo_gasto?.trim()) params.append("tipo_gasto", filters.tipo_gasto.trim());
  const q = params.toString();
  return apiFetch(`/gastos/listado/${TipoPestana.GENERAL}${q ? `?${q}` : ""}`);
};

export const getDetalleGastoGeneral = async (id: number): Promise<GastoGeneral> => {
  return apiFetch(`/gastos/detalle/${TipoPestana.GENERAL}/${id}`);
};

export const guardarGastoGeneral = async (data: {
  tipo_pestaña: string;
  items: { fecha: string; tipo_gasto: string; descripcion: string; monto: number }[];
}): Promise<any> => {
  return apiFetch("/gastos/guardar-pantalla", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const editarGastoGeneral = async (id: number, data: any): Promise<any> => {
  return apiFetch(`/gastos/editar/${TipoPestana.GENERAL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const eliminarGastoGeneral = async (id: number): Promise<any> => {
  return apiFetch(`/gastos/eliminar/${TipoPestana.GENERAL}/${id}`, { method: "DELETE" });
};
