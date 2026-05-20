// src/types/documento.types.ts

export enum TipoCategoria {
  CONDUCTOR = 'Conductor',
  TRACTO = 'Tracto',
  SEMIREMOLQUE = 'Semiremolque',
  REMOLQUE = 'Remolque',
  VIAJE_INTERNACIONAL = 'Viaje_internacional',
  VIAJE_NAClONAL = 'Viaje_nacional',
}

export interface CategoriaEntidad {
  id_categoria: number;
  tipo_categoria: TipoCategoria;
}

export interface RequisitoDocumento {
  id_requisito_documento: number;
  id_categoria: number;
  nombre_documento: string;
  requiere_vencimiento: boolean;
  es_obligatorio: boolean;
  categoria?: CategoriaEntidad;
}