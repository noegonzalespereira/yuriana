import { apiFetch } from "../api";
import { FacturaItem, TotalesFacturacion, FacturacionFilters } from "@/types/facturacion.types";

const buildQuery = (filters: FacturacionFilters) => {
  const params = new URLSearchParams();
  if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
  if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
  if (filters.id_categoria) params.append("id_categoria", filters.id_categoria);
  const q = params.toString();
  return q ? `?${q}` : "";
};

export const getFacturas = async (filters: FacturacionFilters = {}): Promise<FacturaItem[]> =>
  apiFetch(`/facturacion${buildQuery(filters)}`);

export const getTotalesFacturacion = async (filters: FacturacionFilters = {}): Promise<TotalesFacturacion> =>
  apiFetch(`/facturacion/totales${buildQuery(filters)}`);

export const getFactura = async (id: number): Promise<FacturaItem> =>
  apiFetch(`/facturacion/${id}`);

export const updateFactura = async (id: number, formData: FormData): Promise<FacturaItem> =>
  apiFetch(`/facturacion/${id}`, { method: "PATCH", body: formData });

export const deleteFactura = async (id: number): Promise<void> =>
  apiFetch(`/facturacion/${id}`, { method: "DELETE" });
