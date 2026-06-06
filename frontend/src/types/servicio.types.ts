export enum EstadoPago {
  PAGADO = 'pagado',
  PENDIENTE = 'pendiente',
  RETRASADO = 'retrasado',
}

export enum EstadoServicio {
  EN_CURSO = 'en curso',
  FINALIZADO = 'finalizado',
}

export enum Operador {
  YURIANA = 'yuriana',
  OTROS = 'otros',
}

export enum Moneda {
  DOLAR = 'dolar',
  BOLIVIANOS = 'bolivianos',
}

export interface ServicioItem {
  id_servicio: number;
  codigo_servicio: string;
  id_categoria: number;
  categoria: { id_categoria: number; tipo_categoria: string };
  operador: Operador;
  origen: string;
  destino: string;
  crt?: string;
  id_cliente: number;
  cliente: {
    id_cliente: number;
    nit?: string;
    razon_social?: string;
    persona: { nombre: string; ci?: number };
  };
  id_asignacion: number;
  asignacion: {
    id_asignacion: number;
    conductor: { persona: { ci: number; nombre: string } };
    tracto: { placa: string; categoria?: { tipo_categoria: string } };
    remolque?: { placa: string };
  };
  id_colaborador?: number;
  colaborador?: {
    agencia?: string;
    persona: { nombre: string };
  };
  moneda: Moneda;
  tipo_cambio?: number;
  flete: number;
  flete_adicional?: number;
  total_flete: number;
  fecha_inicio: string;
  fecha_fin?: string;
  periodo_liquidacion?: number;
  fecha_limite_pago?: string;
  descripcion_carga?: string;
  comprobante_pago?: string;
  estado_pago: EstadoPago;
  estado_servicio: EstadoServicio;
  fecha_registro: string;
  factura?: {
    id_factura: number;
    factura_transporte: string;
    monto_factura: number;
    foto_factura?: string;
    fotos: { id_foto_factura: number; url_foto: string }[];
  };
  documentos?: {
    id_documento: number;
    url_documento: string;
    requisito_documento: { nombre_documento: string; id_categoria: number };
  }[];
}

export interface ContadoresServicio {
  en_curso: number;
  pendientes: number;
  retrasados: number;
}

export interface FiltersServicio {
  buscar?: string;
  operador?: string;
  estado_pago?: string;
  estado_servicio?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_categoria?: number;
  facturado?: 'si' | 'no' | '';
}
