export enum EstadoPago {
  PAGADO = 'PAGADO',
  PENDIENTE = 'PENDIENTE',
  RETRASADO = 'RETRASADO',
}
export enum OperacionFleteAdicional {
  SUMA = 'SUMA',
  RESTA = 'RESTA',
}
export enum EstadoServicio {
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
}

export enum Operador {
  YURIANA = 'YURIANA',
  OTROS = 'OTROS',
}

export enum Moneda {
  DOLAR = 'DOLAR',
  BOLIVIANOS = 'BOLIVIANOS',
}

export interface Embarque {
  id_embarque: number;
  crt: string;
  total_unidades: number;
  unidades_restantes: number;
  visible: boolean;
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
  id_embarque?: number | null;
  embarque?: Embarque | null;
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
  operacion_flete_adicional?: OperacionFleteAdicional;
  total_flete: number;
  fecha_inicio: string;
  fecha_fin?: string;
  fecha_pago?: string | null;
  periodo_liquidacion?: number | null;
  fecha_limite_pago?: string | null;
  descripcion_carga?: string;
  comprobante_pago?: string;
  estado_pago: EstadoPago;
  estado_servicio: EstadoServicio;
  fecha_registro: string;
  facturas?: {
    id_factura: number;
    factura_transporte: string;
    monto_factura: number;
    fecha_emision?: string;
    foto_factura?: string;
    fotos: { id_foto_factura: number; url_foto: string }[];
    transmitido: boolean;
  }[];
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
