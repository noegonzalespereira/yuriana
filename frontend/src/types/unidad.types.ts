
export enum EstadoUnidad {
  DISPONIBLE = 'disponible',
  ASIGNADO = 'asignado',
  EN_VIAJE = 'en viaje',
  MANTENIMIENTO = 'mantenimiento',
}

export interface CategoriaUnidad {
  id_categoria: number;
  tipo_categoria: 'tracto' | 'semiremolque' | 'remolque';
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