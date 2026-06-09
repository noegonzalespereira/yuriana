export interface DashboardResumen {
  total_ingresos: number;
  total_gastos: number;
  total_pagos_por_cobrar: number;
  total_pagos_cobrados: number;
}

export interface EstadoResultados {
  mes: string;
  anio: number;
  ingresos_fletes: number;
  ingresos_extras: number;
  total_gastos_servicio: number;
  total_gastos_operativos: number;
  total_gastos_admin: number;
  total_gastos_generales: number;
  utilidad_neta: number;
}

export interface DocumentoVencido {
  id_documento: number;
  tipo: 'CONDUCTOR' | 'UNIDAD';
  nombre: string;
  tipo_documento: string;
  fecha_vencimiento: string;
  urgencia: 'VENCIDO' | 'HOY' | 'PROXIMO';
  dias_restantes: number;
}

export interface UltimoViaje {
  id_servicio: number;
  codigo_servicio: string;
  origen: string;
  destino: string;
  total_flete: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado_pago: 'PAGADO' | 'PENDIENTE' | 'RETRASADO';
  estado_servicio: 'EN_CURSO' | 'FINALIZADO';
  cliente_nombre: string;
  conductor_nombre: string;
  tracto_placa: string;
  remolque_placa: string;
  tipo_categoria: string;
}
