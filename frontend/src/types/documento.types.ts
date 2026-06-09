
export enum TipoCategoria {
  CONDUCTOR = 'CONDUCTOR',
  TRACTO = 'TRACTO',
  SEMIREMOLQUE = 'SEMIREMOLQUE',
  REMOLQUE = 'REMOLQUE',
  VIAJE_INTERNACIONAL = 'VIAJE_INTERNACIONAL',
  VIAJE_NACIONAL = 'VIAJE_NACIONAL',
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