export enum TipoColaborador {
  ATA = 'ATA',
  DESPACHANTE = 'DESPACHANTE',
}

export interface Persona {
  id_persona: number;
  nombre: string;
  ci: number;
  correo: string;
  telefono: string;
  telefono2?: string;
  ciudad: string;
}

export interface Colaborador {
  id_colaborador: number;
  persona: Persona;
  id_persona: number;
  agencia: string;
  tipo_colaborador: TipoColaborador;
  monto: number;
  notas?: string;
}