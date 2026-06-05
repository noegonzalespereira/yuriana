export interface IngresoExtra {
  id_ingreso_extra: number;
  id_empresa: number;
  fecha: string;
  descripcion: string;
  monto: number;
  mes: string;
  anio: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TotalesIngreso {
  totalIngresoExtras: number;
  totalFletes: number;
}

export interface ItemIngresoForm {
  _key: string;
  fecha: string;
  descripcion: string;
  monto: number;
}

export interface IngresoFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
}
