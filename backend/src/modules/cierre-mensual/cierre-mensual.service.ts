import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DocumentoService } from '../documento/documento.service';

@Injectable()
export class CierreMensualService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly documentoService: DocumentoService,
  ) {}

  async getDashboardResumen() {
    const [
      fletesResult,
      extrasResult,
      porCobrarResult,
      cobradosResult,
      gastosServicioResult,
      gastosOpResult,
      gastosAdminResult,
      gastosGralResult,
    ] = await Promise.all([
      this.dataSource.query(
        `SELECT COALESCE(SUM(total_flete), 0) AS total FROM servicio WHERE status = true`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(monto), 0) AS total FROM ingreso_extra WHERE status = true`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(total_flete), 0) AS total FROM servicio WHERE status = true AND estado_pago IN ('PENDIENTE', 'RETRASADO')`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(total_flete), 0) AS total FROM servicio WHERE status = true AND estado_pago = 'PAGADO'`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(total_gastos_bs), 0) AS total FROM gastos_servicio WHERE status = true`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(g.monto), 0) AS total
         FROM gasto_operativo go2
         JOIN gasto g ON go2.id_gasto = g.id_gasto
         WHERE go2.status = true AND g.status = true`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(g.monto), 0) AS total
         FROM gasto_administrativo ga
         JOIN gasto g ON ga.id_gasto = g.id_gasto
         WHERE ga.status = true AND g.status = true`,
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(g.monto), 0) AS total
         FROM gasto_general gg
         JOIN gasto g ON gg.id_gasto = g.id_gasto
         WHERE gg.status = true AND g.status = true`,
      ),
    ]);

    const totalFletes = Number(fletesResult[0]?.total || 0);
    const totalExtras = Number(extrasResult[0]?.total || 0);
    const totalGastosServicio = Number(gastosServicioResult[0]?.total || 0);
    const totalGastosOp = Number(gastosOpResult[0]?.total || 0);
    const totalGastosAdmin = Number(gastosAdminResult[0]?.total || 0);
    const totalGastosGral = Number(gastosGralResult[0]?.total || 0);

    return {
      total_ingresos: +(totalFletes + totalExtras).toFixed(2),
      total_gastos: +(totalGastosServicio + totalGastosOp + totalGastosAdmin + totalGastosGral).toFixed(2),
      total_pagos_por_cobrar: +Number(porCobrarResult[0]?.total || 0).toFixed(2),
      total_pagos_cobrados: +Number(cobradosResult[0]?.total || 0).toFixed(2),
    };
  }

  async getEstadoResultados(mes: string, anio: number) {
    const mesNum = parseInt(mes, 10);

    const [
      fletesResult,
      extrasResult,
      gastosServicioResult,
      gastosOpResult,
      gastosAdminResult,
      gastosGralResult,
    ] = await Promise.all([
      this.dataSource.query(
        `SELECT COALESCE(SUM(total_flete), 0) AS total FROM servicio WHERE status = true AND mes = $1 AND anio = $2`,
        [mes, anio],
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(monto), 0) AS total FROM ingreso_extra WHERE status = true AND mes = $1 AND anio = $2`,
        [mes, anio],
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(gs.total_gastos_bs), 0) AS total
         FROM gastos_servicio gs
         WHERE gs.status = true
           AND EXTRACT(MONTH FROM gs.fecha_registro) = $1
           AND EXTRACT(YEAR FROM gs.fecha_registro) = $2`,
        [mesNum, anio],
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(g.monto), 0) AS total
         FROM gasto_operativo go2
         JOIN gasto g ON go2.id_gasto = g.id_gasto
         WHERE go2.status = true AND g.status = true AND g.mes = $1 AND g.anio = $2`,
        [mes, anio],
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(g.monto), 0) AS total
         FROM gasto_administrativo ga
         JOIN gasto g ON ga.id_gasto = g.id_gasto
         WHERE ga.status = true AND g.status = true AND g.mes = $1 AND g.anio = $2`,
        [mes, anio],
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(g.monto), 0) AS total
         FROM gasto_general gg
         JOIN gasto g ON gg.id_gasto = g.id_gasto
         WHERE gg.status = true AND g.status = true AND g.mes = $1 AND g.anio = $2`,
        [mes, anio],
      ),
    ]);

    const ingresos_fletes = +Number(fletesResult[0]?.total || 0).toFixed(2);
    const ingresos_extras = +Number(extrasResult[0]?.total || 0).toFixed(2);
    const total_gastos_servicio = +Number(gastosServicioResult[0]?.total || 0).toFixed(2);
    const total_gastos_operativos = +Number(gastosOpResult[0]?.total || 0).toFixed(2);
    const total_gastos_admin = +Number(gastosAdminResult[0]?.total || 0).toFixed(2);
    const total_gastos_generales = +Number(gastosGralResult[0]?.total || 0).toFixed(2);

    const total_ingresos = ingresos_fletes + ingresos_extras;
    const total_gastos = total_gastos_servicio + total_gastos_operativos + total_gastos_admin + total_gastos_generales;
    const utilidad_neta = +(total_ingresos - total_gastos).toFixed(2);

    return {
      mes,
      anio,
      ingresos_fletes,
      ingresos_extras,
      total_gastos_servicio,
      total_gastos_operativos,
      total_gastos_admin,
      total_gastos_generales,
      utilidad_neta,
    };
  }

  async getDocumentosVencidos() {
    const [vencidos, porVencer] = await Promise.all([
      this.documentoService.obtenerVencidos(),
      this.documentoService.obtenerPorVencer(),
    ]);

    const todos = [...vencidos, ...porVencer];

    return todos.map((doc: any) => {
      const esConductor = !!doc.id_conductor;
      const diasRestantes: number = doc.dias_restantes ?? 0;

      let urgencia: string;
      if (diasRestantes < 0) urgencia = 'VENCIDO';
      else if (diasRestantes === 0) urgencia = 'HOY';
      else urgencia = 'PROXIMO';

      return {
        id_documento: doc.id_documento,
        tipo: esConductor ? 'CONDUCTOR' : 'UNIDAD',
        nombre: esConductor
          ? (doc.conductor?.persona?.nombre ?? 'N/A')
          : (doc.unidad?.placa ?? 'N/A'),
        tipo_documento: doc.requisito_documento?.nombre_documento ?? 'Documento',
        fecha_vencimiento: doc.fecha_vencimiento,
        urgencia,
        dias_restantes: diasRestantes,
      };
    });
  }

  async getUltimosViajes() {
    const viajes = await this.dataSource.query(
      `SELECT
         s.id_servicio,
         s.codigo_servicio,
         s.origen,
         s.destino,
         s.total_flete,
         s.fecha_inicio,
         s.fecha_fin,
         s.estado_pago,
         s.estado_servicio,
         cl.razon_social AS cliente_nombre,
         p.nombre        AS conductor_nombre,
         u.placa         AS tracto_placa,
         u2.placa        AS remolque_placa,
         cat.tipo_categoria
       FROM servicio s
       LEFT JOIN cliente cl          ON s.id_cliente    = cl.id_cliente
       LEFT JOIN asignacion_unidad a ON s.id_asignacion = a.id_asignacion
       LEFT JOIN conductor c         ON a.id_conductor  = c.id_conductor
       LEFT JOIN persona p           ON c.id_persona    = p.id_persona
       LEFT JOIN unidad u            ON a.id_tracto     = u.id_unidad
       LEFT JOIN unidad u2           ON a.id_remolque   = u2.id_unidad
       LEFT JOIN categoria_entidad cat ON s.id_categoria = cat.id_categoria
       WHERE s.status = true
       ORDER BY s."createdAt" DESC
       LIMIT 5`,
    );

    return viajes;
  }
}
