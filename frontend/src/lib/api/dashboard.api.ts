import { apiFetch } from "../api";

export interface TotalesIngresos {
  totalFletes: number;
  totalIngresoExtras: number;
  totalIngresos: number;
}

export interface TotalesGastos {
  totalGastosViaje: number;
  totalGastosOperativos: number;
  totalGastosAdministrativos: number;
  totalGastosGenerales: number;
  totalGastos: number;
}

export interface TotalesPagos {
  total_por_cobrar: number;
  total_cobrado: number;
  total_retrasado: number;
}

export interface DocumentoAlerta {
  id_documento: number;
  tipo: "CONDUCTOR" | "UNIDAD";
  nombre: string;
  tipo_documento: string;
  fecha_vencimiento: string;
  urgencia: "VENCIDO" | "HOY" | "PROXIMO";
  dias_restantes: number;
}

export interface ViajeReciente {
  id_servicio: number;
  codigo_servicio: string;
  origen: string;
  destino: string;
  total_flete: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado_pago: "PAGADO" | "PENDIENTE" | "RETRASADO";
  estado_servicio: "EN_CURSO" | "FINALIZADO";
  cliente_nombre: string;
  conductor_nombre: string;
  tracto_placa: string;
  remolque_placa: string;
  tipo_categoria: string;
}

const qs = (mes: string, anio: number) => `mes=${mes}&anio=${anio}`;

export const getAniosDisponibles = (): Promise<number[]> =>
  apiFetch("/gastos/anios-disponibles");

export const getTotalesIngresos = (mes: string, anio: number): Promise<TotalesIngresos> =>
  apiFetch(`/ingreso-extra/totales?${qs(mes, anio)}`);

export const getTotalesGastos = (mes: string, anio: number): Promise<TotalesGastos> =>
  apiFetch(`/gastos/totales-paneles?${qs(mes, anio)}`);

export const getTotalesPagos = (mes: string, anio: number): Promise<TotalesPagos> =>
  apiFetch(`/servicio/totales-pagos?${qs(mes, anio)}`);

export const getAlertasDashboard = (): Promise<DocumentoAlerta[]> =>
  apiFetch("/documento/alertas/dashboard");

export const getViajesRecientes = (): Promise<ViajeReciente[]> =>
  apiFetch("/servicio/recientes");
