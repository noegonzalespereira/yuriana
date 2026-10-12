// src/components/organisms/reportes/ReporteServicios.tsx
"use client";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { Empresa } from "@/types/empresa.types";
import { ServicioItem } from "@/types/servicio.types";

export interface FilaReporteServicio {
  id: number;
  codigo: string;
  empresa: string;
  placa: string;
  ruta: string;
  flete: number;
  fechaInicio: string;
  fechaFin: string;
  facturas: string;
}

const fechaCorta = (iso?: string | null) => (iso ? iso.slice(0, 10) : "-");

export const servicioAFila = (s: ServicioItem): FilaReporteServicio => ({
  id: s.id_servicio,
  codigo: s.codigo_servicio,
  empresa: s.cliente?.persona?.nombre ?? "-",
  placa: s.asignacion?.tracto?.placa ?? s.asignacion_otros?.placa ?? "-",
  ruta: `${s.origen} → ${s.destino}`,
  flete: Number(s.total_flete) || 0,
  fechaInicio: fechaCorta(s.fecha_inicio),
  fechaFin: fechaCorta(s.fecha_fin),
  facturas: (s.facturas ?? []).map((f) => f.factura_transporte).filter(Boolean).join(", ") || "-",
});

const ORANGE = "#E64D24";
const DARK = "#3A3F47";

const COL = {
  n: "5%",
  codigo: "12%",
  empresa: "20%",
  placa: "11%",
  ruta: "20%",
  flete: "10%",
  fechas: "14%",
  factura: "8%",
};

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 50, paddingHorizontal: 36, backgroundColor: "#FFFFFF", fontFamily: "Helvetica", fontSize: 8, color: "#000000" },
  barTopDark: { position: "absolute", top: 0, right: 30, width: 150, height: 14, backgroundColor: DARK, transform: "skewX(-35deg)" },
  barTopOrange: { position: "absolute", top: 0, right: 150, width: 60, height: 14, backgroundColor: ORANGE, transform: "skewX(-35deg)" },
  barBottomDark: { position: "absolute", bottom: 0, left: 0, width: 190, height: 14, backgroundColor: DARK, transform: "skewX(-35deg)" },
  barBottomOrange: { position: "absolute", bottom: 0, left: 150, width: 60, height: 14, backgroundColor: ORANGE, transform: "skewX(-35deg)" },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 6, borderBottomWidth: 2, borderColor: ORANGE },
  logo: { width: 52, height: 52, objectFit: "contain", marginRight: 12 },
  title: { fontSize: 14, fontWeight: "bold", color: DARK },
  subtitle: { fontSize: 8, marginTop: 2, color: "#555555" },
  infoRow: { flexDirection: "row", marginTop: 12, marginBottom: 14 },
  infoBox: { width: "45%", marginRight: 20 },
  infoTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 3 },
  infoText: { fontSize: 8, lineHeight: 1.4 },
  tableHead: { flexDirection: "row", backgroundColor: DARK, color: "#FFFFFF", fontWeight: "bold", fontSize: 7, textTransform: "uppercase" },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#BBBBBB", minHeight: 20, alignItems: "center" },
  cell: { paddingHorizontal: 5, paddingVertical: 4, borderRightWidth: 0.5, borderColor: "#BBBBBB" },
  cellHead: { paddingHorizontal: 5, paddingVertical: 6, textAlign: "center" },
  totalRow: { flexDirection: "row", backgroundColor: "#FFF3EC", borderWidth: 0.5, borderColor: "#BBBBBB", marginTop: 0 },
});

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface Props {
  filas: FilaReporteServicio[];
  fechaInicio: string;
  fechaFin: string;
  infoEmpresa: Empresa | null;
}

export const ReporteServicios = ({ filas, fechaInicio, fechaFin, infoEmpresa }: Props) => {
  const total = filas.reduce((acc, f) => acc + f.flete, 0);

  return (
    <Document title={`Reporte_viajes_${fechaInicio}_${fechaFin}`}>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View fixed style={styles.barTopDark} />
        <View fixed style={styles.barTopOrange} />
        <View fixed style={styles.barBottomDark} />
        <View fixed style={styles.barBottomOrange} />

        <View style={styles.header}>
          {infoEmpresa?.logo_url ? <Image src={infoEmpresa.logo_url} style={styles.logo} /> : null}
          <View>
            <Text style={styles.title}>{infoEmpresa?.nombre || "YURIANA S.R.L."}</Text>
            <Text style={styles.subtitle}>REPORTE DE VIAJES</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>DATOS EMPRESA</Text>
            <Text style={styles.infoText}>{infoEmpresa?.nombre || "YURIANA S.R.L."}</Text>
            {infoEmpresa?.nit ? <Text style={styles.infoText}>NIT: {infoEmpresa.nit}</Text> : null}
            {infoEmpresa?.direccion ? <Text style={styles.infoText}>{infoEmpresa.direccion}</Text> : null}
            {infoEmpresa?.correo ? <Text style={styles.infoText}>{infoEmpresa.correo}</Text> : null}
            {infoEmpresa?.telefono ? <Text style={styles.infoText}>{infoEmpresa.telefono}</Text> : null}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>DATOS DEL REPORTE</Text>
            <Text style={styles.infoText}>Desde: {fechaInicio}</Text>
            <Text style={styles.infoText}>Hasta: {fechaFin}</Text>
            <Text style={styles.infoText}>Total de viajes: {filas.length}</Text>
            <Text style={styles.infoText}>Flete total: {fmt(total)} Bs</Text>
          </View>
        </View>

        <View fixed style={styles.tableHead}>
          <Text style={[styles.cellHead, { width: COL.n }]}>N°</Text>
          <Text style={[styles.cellHead, { width: COL.codigo }]}>Código viaje</Text>
          <Text style={[styles.cellHead, { width: COL.empresa }]}>Empresa</Text>
          <Text style={[styles.cellHead, { width: COL.placa }]}>Vehículo</Text>
          <Text style={[styles.cellHead, { width: COL.ruta }]}>Ruta</Text>
          <Text style={[styles.cellHead, { width: COL.flete }]}>Flete total</Text>
          <Text style={[styles.cellHead, { width: COL.fechas }]}>Fechas</Text>
          <Text style={[styles.cellHead, { width: COL.factura }]}>N° factura</Text>
        </View>

        {filas.map((f, i) => (
          <View key={f.id} style={styles.row} wrap={false}>
            <Text style={[styles.cell, { width: COL.n, textAlign: "center" }]}>{i + 1}</Text>
            <Text style={[styles.cell, { width: COL.codigo, fontWeight: "bold" }]}>{f.codigo}</Text>
            <Text style={[styles.cell, { width: COL.empresa }]}>{f.empresa}</Text>
            <Text style={[styles.cell, { width: COL.placa }]}>{f.placa}</Text>
            <Text style={[styles.cell, { width: COL.ruta }]}>{f.ruta}</Text>
            <Text style={[styles.cell, { width: COL.flete, textAlign: "right" }]}>{fmt(f.flete)}</Text>
            <Text style={[styles.cell, { width: COL.fechas }]}>
              {`Inicio: ${f.fechaInicio}`}
              {f.fechaFin !== "-" ? `\nFin: ${f.fechaFin}` : ""}
            </Text>
            <Text style={[styles.cell, { width: COL.factura, borderRightWidth: 0 }]}>{f.facturas}</Text>
          </View>
        ))}

        <View style={styles.totalRow} wrap={false}>
          <Text style={[styles.cell, { width: "68%", textAlign: "right", fontWeight: "bold" }]}>TOTAL</Text>
          <Text style={[styles.cell, { width: COL.flete, textAlign: "right", fontWeight: "bold" }]}>{fmt(total)}</Text>
          <Text style={[styles.cell, { width: "22%", borderRightWidth: 0 }]}> </Text>
        </View>
      </Page>
    </Document>
  );
};
