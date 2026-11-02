// src/components/organisms/reportes/reporteBase.tsx
// Estilos y piezas compartidas por los reportes PDF (mismo diseño que ReporteServicios).
"use client";
import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { Empresa } from "@/types/empresa.types";

export const ORANGE = "#E64D24";
export const DARK = "#3A3F47";

export const fmtMonto = (n: number) =>
  new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export const estilos = StyleSheet.create({
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
  totalRow: { flexDirection: "row", backgroundColor: "#FFF3EC", borderWidth: 0.5, borderColor: "#BBBBBB" },
  seccionTitulo: { fontSize: 9, fontWeight: "bold", color: DARK, marginTop: 12, marginBottom: 4 },
});

export const BarrasDecorativas = () => (
  <>
    <View fixed style={estilos.barTopDark} />
    <View fixed style={estilos.barTopOrange} />
    <View fixed style={estilos.barBottomDark} />
    <View fixed style={estilos.barBottomOrange} />
  </>
);

export const CabeceraReporte = ({ infoEmpresa, subtitulo }: { infoEmpresa: Empresa | null; subtitulo: string }) => (
  <View style={estilos.header}>
    {infoEmpresa?.logo_url ? <Image src={infoEmpresa.logo_url} style={estilos.logo} /> : null}
    <View>
      <Text style={estilos.title}>{infoEmpresa?.nombre || "YURIANA S.R.L."}</Text>
      <Text style={estilos.subtitle}>{subtitulo}</Text>
    </View>
  </View>
);

export const InfoEmpresaBox = ({ infoEmpresa }: { infoEmpresa: Empresa | null }) => (
  <View style={estilos.infoBox}>
    <Text style={estilos.infoTitle}>DATOS EMPRESA</Text>
    <Text style={estilos.infoText}>{infoEmpresa?.nombre || "YURIANA S.R.L."}</Text>
    {infoEmpresa?.nit ? <Text style={estilos.infoText}>NIT: {infoEmpresa.nit}</Text> : null}
    {infoEmpresa?.direccion ? <Text style={estilos.infoText}>{infoEmpresa.direccion}</Text> : null}
    {infoEmpresa?.correo ? <Text style={estilos.infoText}>{infoEmpresa.correo}</Text> : null}
    {infoEmpresa?.telefono ? <Text style={estilos.infoText}>{infoEmpresa.telefono}</Text> : null}
  </View>
);
