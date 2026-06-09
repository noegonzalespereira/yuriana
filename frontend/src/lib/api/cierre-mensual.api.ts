import { apiFetch } from "../api";
import {
  DashboardResumen,
  EstadoResultados,
  DocumentoVencido,
  UltimoViaje,
} from "@/types/cierre-mensual.types";

export const getDashboardResumen = async (): Promise<DashboardResumen> => {
  return apiFetch("/cierre-mensual/resumen");
};

export const getEstadoResultados = async (
  mes: string,
  anio: number
): Promise<EstadoResultados> => {
  return apiFetch(`/cierre-mensual/estado-resultados?mes=${mes}&anio=${anio}`);
};

export const getDocumentosVencidos = async (): Promise<DocumentoVencido[]> => {
  return apiFetch("/cierre-mensual/documentos-vencidos");
};

export const getUltimosViajes = async (): Promise<UltimoViaje[]> => {
  return apiFetch("/cierre-mensual/ultimos-viajes");
};
