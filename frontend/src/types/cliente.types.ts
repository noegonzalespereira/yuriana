import { Persona } from "./colaborador.types"; // Reutilizamos la interfaz Persona

export interface Cliente {
  id_cliente: number;
  codigo_cliente: string;
  nit: number;
  razon_social: string;
  persona: Persona;
  id_persona: number;
  direccion?: string;
  notas?: string;
}