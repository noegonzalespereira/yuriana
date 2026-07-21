import { apiFetch } from "../api";
import { Empresa } from "@/types/empresa.types";

export const getEmpresa = async (): Promise<Empresa | null> => {
  try {
    // Es más directo y eficiente obtener la empresa por su ID (asumiendo que es 1)
    // en lugar de traer toda la lista.
    const empresa: Empresa = await apiFetch("/empresa/1");
    return empresa;
  } catch (error) {
    console.error("No se pudo cargar la información de la empresa. Asegúrate de que exista un registro con id_empresa = 1.", error);
    return null;
  }
};

export const createEmpresa = async (data: FormData): Promise<Empresa> => {
  return apiFetch("/empresa", { method: "POST", body: data });
};

export const updateEmpresa = async (id: number, data: FormData): Promise<Empresa> => {
  return apiFetch(`/empresa/${id}`, { method: "PATCH", body: data });
};
