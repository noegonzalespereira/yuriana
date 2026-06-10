export interface FacturaItem {
  id_factura: number;
  factura_transporte: string;
  monto_factura: number;
  foto_factura?: string;
  fotos?: { id_foto_factura: number; url_foto: string }[];
  fecha_emision: string;
  mes: string;
  anio: number;
  servicio: {
    id_servicio: number;
    codigo_servicio: string;
    categoria: { id_categoria: number; tipo_categoria: string };
  };
}

export interface TotalesFacturacion {
  total_facturado: number;
  impuesto_it: number;
}

export interface FacturacionFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  id_categoria?: string;
}
