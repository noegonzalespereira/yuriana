// src/components/organisms/reportes/ReportesFinanzas.tsx
// Reportes PDF de Gastos, Ingresos extra y Facturación, armados sobre ReporteTabla.
"use client";
import { Empresa } from "@/types/empresa.types";
import { GastosServicio, GastoOperativo, GastoAdministrativo, GastoGeneral } from "@/types/gasto.types";
import { IngresoExtra } from "@/types/ingreso-extra.types";
import { FacturaItem } from "@/types/facturacion.types";
import { formatDateBolivia } from "@/lib/date-bolivia";
import { ReporteTabla, ColumnaReporte, SeccionReporte } from "./ReporteTabla";
import { fmtMonto } from "./reporteBase";

interface Base {
  fechaInicio: string;
  fechaFin: string;
  infoEmpresa: Empresa | null;
}

const suma = (xs: number[]) => xs.reduce((a, b) => a + (Number(b) || 0), 0);
const tipoLabel = (t?: string | null) => (t ? t.replace(/_/g, " ") : "-");
const rango = (b: Base) => [`Desde: ${b.fechaInicio || "-"}`, `Hasta: ${b.fechaFin || "-"}`];
const nombreArchivo = (prefijo: string, b: Base) => `${prefijo}_${b.fechaInicio || "inicio"}_${b.fechaFin || "fin"}`;

// ── Gastos por pestaña ─────────────────────────────────────────────────────

const COL_MONTO_DESC: ColumnaReporte[] = [
  { titulo: "Fecha", ancho: 13 },
  { titulo: "Tipo de gasto", ancho: 22 },
  { titulo: "Descripción", ancho: 45 },
  { titulo: "Monto Bs", ancho: 15, align: "right" },
];

const seccionTipoDescripcion = (
  items: { fecha: string; tipo: string; descripcion: string; monto: number }[],
  titulo?: string,
): SeccionReporte => ({
  titulo,
  filas: items.map((g) => [formatDateBolivia(g.fecha), tipoLabel(g.tipo), g.descripcion, fmtMonto(g.monto)]),
  totalFila: ["", "", "TOTAL", fmtMonto(suma(items.map((g) => g.monto)))],
});

export const ReporteGastosServicio = ({ data, ...b }: Base & { data: GastosServicio[] }) => {
  const total = suma(data.map((g) => g.total_gastos_bs));
  return (
    <ReporteTabla
      titulo="REPORTE DE COSTOS DEL SERVICIO"
      nombreArchivo={nombreArchivo("Reporte_costos_servicio", b)}
      infoEmpresa={b.infoEmpresa}
      datos={[...rango(b), `Total de registros: ${data.length}`, `Total gastos: ${fmtMonto(total)} Bs`]}
      columnas={[
        { titulo: "Fecha", ancho: 13 },
        { titulo: "ID Viaje", ancho: 17 },
        { titulo: "Moneda", ancho: 10 },
        { titulo: "Viático Bs", ancho: 18, align: "right" },
        { titulo: "Monto total Bs", ancho: 20, align: "right" },
        { titulo: "Saldo Bs", ancho: 17, align: "right" },
      ]}
      secciones={[{
        filas: data.map((g) => [
          formatDateBolivia(g.fecha_registro),
          g.servicio?.codigo_servicio ?? `#${g.id_servicio}`,
          g.moneda,
          fmtMonto(Number(g.viatico_bs)),
          fmtMonto(Number(g.total_gastos_bs)),
          fmtMonto(Number(g.saldo_bs)),
        ]),
        totalFila: [
          "", "", "TOTAL",
          fmtMonto(suma(data.map((g) => Number(g.viatico_bs)))),
          fmtMonto(total),
          fmtMonto(suma(data.map((g) => Number(g.saldo_bs)))),
        ],
      }]}
    />
  );
};

export const ReporteGastosOperativos = ({ data, ...b }: Base & { data: GastoOperativo[] }) => {
  const total = suma(data.map((g) => g.gasto.monto));
  return (
    <ReporteTabla
      titulo="REPORTE DE GASTOS OPERATIVOS"
      nombreArchivo={nombreArchivo("Reporte_gastos_operativos", b)}
      infoEmpresa={b.infoEmpresa}
      datos={[...rango(b), `Total de registros: ${data.length}`, `Total gastos: ${fmtMonto(total)} Bs`]}
      columnas={[
        { titulo: "Placa", ancho: 12 },
        { titulo: "Fecha", ancho: 12 },
        { titulo: "Tipo de gasto", ancho: 18 },
        { titulo: "Descripción", ancho: 38 },
        { titulo: "Monto Bs", ancho: 15, align: "right" },
      ]}
      secciones={[{
        filas: data.map((g) => [
          g.unidad?.placa ?? "-",
          formatDateBolivia(g.gasto.fecha),
          tipoLabel(g.tipo_gasto),
          g.gasto.descripcion,
          fmtMonto(Number(g.gasto.monto)),
        ]),
        totalFila: ["", "", "", "TOTAL", fmtMonto(total)],
      }]}
    />
  );
};

const ReporteGastosTipoDescripcion = ({
  titulo, prefijo, items, ...b
}: Base & { titulo: string; prefijo: string; items: { fecha: string; tipo: string; descripcion: string; monto: number }[] }) => {
  const total = suma(items.map((g) => g.monto));
  return (
    <ReporteTabla
      titulo={titulo}
      nombreArchivo={nombreArchivo(prefijo, b)}
      infoEmpresa={b.infoEmpresa}
      datos={[...rango(b), `Total de registros: ${items.length}`, `Total gastos: ${fmtMonto(total)} Bs`]}
      columnas={COL_MONTO_DESC}
      secciones={[seccionTipoDescripcion(items)]}
    />
  );
};

export const ReporteGastosAdministrativos = ({ data, ...b }: Base & { data: GastoAdministrativo[] }) => (
  <ReporteGastosTipoDescripcion
    {...b}
    titulo="REPORTE DE GASTOS ADMINISTRATIVOS"
    prefijo="Reporte_gastos_administrativos"
    items={data.map((g) => ({ fecha: g.gasto.fecha, tipo: g.tipo_gasto, descripcion: g.gasto.descripcion, monto: Number(g.gasto.monto) }))}
  />
);

export const ReporteGastosGenerales = ({ data, ...b }: Base & { data: GastoGeneral[] }) => (
  <ReporteGastosTipoDescripcion
    {...b}
    titulo="REPORTE DE GASTOS GENERALES"
    prefijo="Reporte_gastos_generales"
    items={data.map((g) => ({ fecha: g.gasto.fecha, tipo: g.tipo_gasto, descripcion: g.gasto.descripcion, monto: Number(g.gasto.monto) }))}
  />
);

// ── Gastos: reporte general (las 4 categorías consolidadas) ────────────────

export const ReporteGastosConsolidado = ({
  servicio, operativos, administrativos, generales, ...b
}: Base & {
  servicio: GastosServicio[];
  operativos: GastoOperativo[];
  administrativos: GastoAdministrativo[];
  generales: GastoGeneral[];
}) => {
  const grupos = [
    {
      titulo: "COSTOS DEL SERVICIO",
      items: servicio.map((g) => ({
        fecha: g.fecha_registro,
        tipo: "VIAJE",
        descripcion: `Viaje ${g.servicio?.codigo_servicio ?? `#${g.id_servicio}`}`,
        monto: Number(g.total_gastos_bs),
      })),
    },
    {
      titulo: "GASTOS OPERATIVOS",
      items: operativos.map((g) => ({
        fecha: g.gasto.fecha,
        tipo: g.tipo_gasto,
        descripcion: `${g.unidad?.placa ?? ""} ${g.gasto.descripcion}`.trim(),
        monto: Number(g.gasto.monto),
      })),
    },
    {
      titulo: "GASTOS ADMINISTRATIVOS",
      items: administrativos.map((g) => ({ fecha: g.gasto.fecha, tipo: g.tipo_gasto, descripcion: g.gasto.descripcion, monto: Number(g.gasto.monto) })),
    },
    {
      titulo: "GASTOS GENERALES",
      items: generales.map((g) => ({ fecha: g.gasto.fecha, tipo: g.tipo_gasto, descripcion: g.gasto.descripcion, monto: Number(g.gasto.monto) })),
    },
  ];
  const totalGeneral = suma(grupos.flatMap((g) => g.items.map((i) => i.monto)));
  const totalRegistros = grupos.reduce((a, g) => a + g.items.length, 0);

  return (
    <ReporteTabla
      titulo="REPORTE GENERAL DE GASTOS"
      nombreArchivo={nombreArchivo("Reporte_gastos_general", b)}
      infoEmpresa={b.infoEmpresa}
      datos={[
        ...rango(b),
        `Total de registros: ${totalRegistros}`,
        ...grupos.map((g) => `${g.titulo}: ${fmtMonto(suma(g.items.map((i) => i.monto)))} Bs`),
        `Total gastos: ${fmtMonto(totalGeneral)} Bs`,
      ]}
      columnas={COL_MONTO_DESC}
      secciones={grupos.map((g) => seccionTipoDescripcion(g.items, g.titulo))}
      totalGeneral={["", "", "TOTAL GENERAL", fmtMonto(totalGeneral)]}
    />
  );
};

// ── Ingresos extra ─────────────────────────────────────────────────────────

export const ReporteIngresosExtra = ({ data, ...b }: Base & { data: IngresoExtra[] }) => {
  const total = suma(data.map((i) => Number(i.monto)));
  return (
    <ReporteTabla
      titulo="REPORTE DE INGRESOS EXTRA"
      nombreArchivo={nombreArchivo("Reporte_ingresos_extra", b)}
      infoEmpresa={b.infoEmpresa}
      datos={[...rango(b), `Total de registros: ${data.length}`, `Total ingresos extra: ${fmtMonto(total)} Bs`]}
      columnas={[
        { titulo: "Fecha", ancho: 14 },
        { titulo: "Descripción", ancho: 56 },
        { titulo: "Mes / Año", ancho: 10 },
        { titulo: "Monto Bs", ancho: 15, align: "right" },
      ]}
      secciones={[{
        filas: data.map((i) => [formatDateBolivia(i.fecha), i.descripcion, `${i.mes}/${i.anio}`, fmtMonto(Number(i.monto))]),
        totalFila: ["", "TOTAL", "", fmtMonto(total)],
      }]}
    />
  );
};

// ── Facturas ───────────────────────────────────────────────────────────────

const tipoViaje = (t?: string) => (t?.includes("INTERNACIONAL") ? "Internacional" : t?.includes("NACIONAL") ? "Nacional" : (t ?? "-"));

export const ReporteFacturas = ({ data, ...b }: Base & { data: FacturaItem[] }) => {
  const total = suma(data.map((f) => Number(f.monto_factura)));
  const it = total * 0.03;
  return (
    <ReporteTabla
      titulo="REPORTE DE FACTURACIÓN"
      nombreArchivo={nombreArchivo("Reporte_facturacion", b)}
      infoEmpresa={b.infoEmpresa}
      datos={[
        ...rango(b),
        `Total de facturas: ${data.length}`,
        `Total facturado: ${fmtMonto(total)} Bs`,
        `Impuesto estimado (3% IT): ${fmtMonto(it)} Bs`,
      ]}
      columnas={[
        { titulo: "ID Viaje", ancho: 15 },
        { titulo: "Factura de transporte", ancho: 25 },
        { titulo: "Tipo viaje", ancho: 15 },
        { titulo: "Fecha emisión", ancho: 14 },
        { titulo: "Monto Bs", ancho: 13, align: "right" },
        { titulo: "IT 3% Bs", ancho: 13, align: "right" },
      ]}
      secciones={[{
        filas: data.map((f) => [
          f.servicio?.codigo_servicio ?? "-",
          f.factura_transporte,
          tipoViaje(f.servicio?.categoria?.tipo_categoria),
          formatDateBolivia(f.fecha_emision),
          fmtMonto(Number(f.monto_factura)),
          fmtMonto(Number(f.monto_factura) * 0.03),
        ]),
        totalFila: ["", "", "", "TOTAL", fmtMonto(total), fmtMonto(it)],
      }]}
    />
  );
};
