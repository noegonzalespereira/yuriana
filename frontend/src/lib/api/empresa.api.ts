import { apiFetch } from "../api";
import { Empresa } from "@/types/empresa.types";

export const getEmpresa = async (): Promise<Empresa | null> => {
  const data: Empresa[] = await apiFetch("/empresa");
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
};

export const createEmpresa = async (data: FormData): Promise<Empresa> => {
  return apiFetch("/empresa", { method: "POST", body: data });
};

export const updateEmpresa = async (id: number, data: FormData): Promise<Empresa> => {
  return apiFetch(`/empresa/${id}`, { method: "PATCH", body: data });
};
