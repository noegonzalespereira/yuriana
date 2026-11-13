export enum TipoPestana {
  SERVICIO = 'SERVICIO',
  OPERATIVO = 'OPERATIVO',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  GENERAL = 'GENERAL',
}

export enum TipoGastoServicio {
  VIATICOS = 'VIATICOS',
  PEAJES = 'PEAJES',
  ATA_ORIGEN = 'ATA_ORIGEN',
  ATA_FRONTERA = 'ATA_FRONTERA',
  OTROS = 'OTROS',
}

export enum TipoGastoOperativo {
  MANTENIMIENTO = 'MANTENIMIENTO',
  COMBUSTIBLE = 'COMBUSTIBLE',
  REPUESTOS = 'REPUESTOS',
  TALLER = 'TALLER',
  LLANTAS = 'LLANTAS',
}

export enum TipoGastoAdministrativo {
  CONTADOR = 'CONTADOR',
  IMPUESTO = 'IMPUESTO',
  GPS = 'GPS',
  SUELDO_CONDUCTORES = 'SUELDO_CONDUCTORES',
  OTROS = 'OTROS',
}

export enum TipoGastoGeneral {
  EQUIPAMIENTO_TALLER = 'EQUIPAMIENTO_DE_TALLER',
  GASTOS_DE_ESCRITORIO = 'GASTOS_DE_ESCRITORIO',
  OTROS = 'OTROS',
}

export interface Gasto {
  id_gasto: number;
  fecha: string;
  mes: string;
  anio: number;
  descripcion: string;
  monto: number;
}

export interface DetalleGastoServicio {
  id_detalle_servicio: number;
  id_gasto_servicio: number;
  id_gasto: number;
  tipo_gasto: TipoGastoServicio;
  monto_bs: number;
  gasto: Gasto;
}

export interface ServicioResumen {
  id_servicio: number;
  codigo_servicio: string;
  origen: string;
  destino: string;
  categoria?: { id_categoria: number; nombre?: string; tipo_categoria?: string };
  asignacion?: {
    conductor?: {
      persona: {
        ci: number;
        nombre: string;
        telefono?: string;
        correo?: string;
      };
    };
    tracto?: { placa: string };
  };
  asignacion_otros?: { placa: string } | null;
  cliente?: {
    razon_social?: string;
    persona?: { nombre: string };
  };
}

export interface GastosServicio {
  id_gasto_servicio: number;
  id_servicio: number;
  tipo_cambio: number;
  moneda: string;
  viatico_entregado: number;
  viatico_bs: number;
  total_gastos: number;
  total_gastos_bs: number;
  saldo: number;
  saldo_bs: number;
  fecha_registro: string;
  servicio?: ServicioResumen;
  detalles?: DetalleGastoServicio[];
}

export interface TotalesPaneles {
  totalGastosViaje: number;
  totalGastosOperativos: number;
  totalGastosAdministrativos: number;
  totalGastosGenerales: number;
}

export interface ItemGastoForm {
  _key: string;
  /** Present only for items already persisted in the database. */
  id_detalle?: number;
  fecha: string;
  tipo_gasto: string;
  descripcion: string;
  monto: number;
}

export interface GastoAdministrativo {
  id_gasto_admin: number;
  id_gasto: number;
  gasto: {
    id_gasto: number;
    fecha: string;
    mes: string;
    anio: number;
    descripcion: string;
    monto: number;
    status: boolean;
  };
  tipo_gasto: TipoGastoAdministrativo;
  id_empresa: number;
  status: boolean;
}

export interface GastoOperativo {
  id_gasto_operativo: number;
  id_unidad: number;
  unidad: {
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
    categoria?: { tipo_categoria: string };
  };
  id_gasto: number;
  gasto: {
    id_gasto: number;
    fecha: string;
    mes: string;
    anio: number;
    descripcion: string;
    monto: number;
    status: boolean;
  };
  tipo_gasto: TipoGastoOperativo;
  status: boolean;
}

export interface GastoGeneral {
  id_gasto_general: number;
  id_gasto: number;
  gasto: {
    id_gasto: number;
    fecha: string;
    mes: string;
    anio: number;
    descripcion: string;
    monto: number;
    status: boolean;
  };
  tipo_gasto: TipoGastoGeneral;
  id_empresa: number;
  status: boolean;
}
