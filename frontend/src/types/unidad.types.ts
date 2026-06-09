
export enum EstadoUnidad {
  DISPONIBLE = 'DISPONIBLE',
  ASIGNADO = 'ASIGNADO',
  EN_VIAJE = 'EN VIAJE',
  MANTENIMIENTO = 'MANTENIMIENTO',
}

export interface CategoriaUnidad {
  id_categoria: number;
  tipo_categoria: 'TRACTO' | 'SEMIREMOLQUE' | 'REMOLQUE';
  status: boolean;
}

export interface FotoUnidad {
  id_foto: number;
  id_unidad: number;
  url_foto: string;
  status: boolean;
}

export interface Unidad {
  id_unidad: number;
  placa: string;
  id_categoria: number;
  categoria: CategoriaUnidad;
  num_chasis: string;
  marca: string;
  color: string;
  anio: number;
  modelo: string;
  estado_unidad: EstadoUnidad;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  
  // Relación con fotos (cargada opcionalmente por el backend)
  fotos?: FotoUnidad[];

  // Atributos dinámicos enriquecidos por el DocumentoService proxy
  estado?: 'vigente' | 'por_vencer' | 'vencido' | 'sin_documentos';
  documento_critico?: string | null;
}