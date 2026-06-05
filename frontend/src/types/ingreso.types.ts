export interface IngresoExtra {
  id_ingreso_extra: number;
  id_empresa: number;
  fecha: string;
  descripcion: string;
  monto: number;
  mes: string;
  anio: number;
  status: boolean;
}

export interface TotalesIngresos {
  totalIngresoExtras: number;
  totalFletes: number;
}
