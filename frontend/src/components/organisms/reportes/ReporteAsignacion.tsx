// src/components/organisms/reportes/ReporteAsignacion.tsx
"use client";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { Asignacion } from "@/types/asignacion.types";
import { Empresa } from "@/types/empresa.types";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#FFFFFF", fontFamily: "Helvetica", fontSize: 9, color: "#000000" },
  headerBox: { backgroundColor: "#E64D24", flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 4, marginBottom: 15 },
  logoBox: { backgroundColor: "#FFFFFF", borderRadius: 50, padding: 5, width: 60, height: 60, justifyContent: "center", alignItems: "center" },
  logo: { width: 50, height: 50, borderRadius: 25, objectFit: "contain" },
  headerTextContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold", textAlign: "center", letterSpacing: 1 },
  headerSubtitle: { color: "#FFFFFF", fontSize: 10, textAlign: "center", marginTop: 2 },
  sectionBanner: { backgroundColor: "#E64D24", color: "#FFFFFF", textAlign: "center", fontWeight: "bold", padding: 5, fontSize: 10, textTransform: "uppercase", borderRadius: 2, marginTop: 15, letterSpacing: 0.5 },
  table: { marginTop: 8, borderWidth: 1, borderColor: "#000000", borderRadius: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000000", minHeight: 22, alignItems: "center" },
  tableRowLast: { flexDirection: "row", minHeight: 22, alignItems: "center" },
  cellLabel: { width: "30%", backgroundColor: "#E64D24", color: "#FFFFFF", fontWeight: "bold", paddingHorizontal: 8, fontSize: 8, textTransform: "uppercase", height: "100%", paddingTop: 6, borderRightWidth: 1, borderColor: "#000000" },
  cellValueFull: { width: "70%", paddingHorizontal: 12, fontWeight: "bold", textAlign: "center", fontSize: 9, textTransform: "uppercase" },
  cellValueEmail: { width: "70%", paddingHorizontal: 12, fontWeight: "bold", textAlign: "center", fontSize: 9 },
  cellLabelSub: { width: "20%", backgroundColor: "#E64D24", color: "#FFFFFF", fontWeight: "bold", paddingHorizontal: 6, fontSize: 8, textTransform: "uppercase", height: "100%", paddingTop: 6, borderRightWidth: 1, borderColor: "#000000" },
  cellValueHalfLeft: { width: "40%", paddingHorizontal: 8, textAlign: "center", fontWeight: "bold", fontSize: 9, textTransform: "uppercase", borderRightWidth: 1, borderColor: "#000000", height: "100%", paddingTop: 6 },
  cellValueHalfRight: { width: "40%", paddingHorizontal: 8, textAlign: "center", fontWeight: "bold", fontSize: 9, textTransform: "uppercase", height: "100%", paddingTop: 6 }
});

interface ReporteProps {
  data: Asignacion;
  tipoFormato: "nacional" | "internacional";
  infoEmpresa: Empresa | null; // ◄ Recibe los datos dinámicos de tu módulo empresa
}

export const ReporteAsignacion = ({ data, tipoFormato, infoEmpresa }: ReporteProps) => {
  const conductor = data?.conductor?.persona || { nombre: "SIN CONDUCTOR", apellido: "", ci: "S/CI" };
  const tracto = data?.tracto || { placa: "--", color: "--", marca: "--", modelo: "--", anio: "--", num_chasis: "--", num_poliza: "--", documentos: [] };
  const remolque = data?.remolque || { placa: "--", color: "--", marca: "--", modelo: "--", anio: "--", categoria: { tipo_categoria: "Acoplado" } };

  const normalizarTexto = (valor: string = "") =>
    valor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const documentoSeguroPoliza = (tracto.documentos ?? []).find((doc) => {
    const nombre = normalizarTexto(doc.requisito_documento?.nombre_documento ?? "");
    return (
      nombre.includes("SEGURO") ||
      nombre.includes("POLIZA") ||
      nombre.includes("CTI")
    );
  }) ?? (tracto.documentos ?? []).find((doc) => !!doc.fecha_vencimiento);

  const formatearFechaLocal = (valor: string | Date | null | undefined) => {
    if (!valor) return null;

    const raw = typeof valor === "string" ? valor : valor.toISOString();
    const isoDate = raw.includes("T") ? raw.split("T")[0] : raw;
    const match = /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : null;

    if (!match) return null;

    const [anio, mes, dia] = match.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
  };

  const fechaVencimientoPoliza = formatearFechaLocal(documentoSeguroPoliza?.fecha_vencimiento) ?? "VERIFICAR EN EXPEDIENTE";

  // Valores dinámicos de la empresa con caídas seguras (fallbacks) por si no hay registros aún
  const nombreEmpresa = infoEmpresa?.nombre || "YURIANA S.R.L.";
  const nitEmpresa = infoEmpresa?.nit || "351492020";
  const telfEmpresa = infoEmpresa?.telefono || "(+591) 72555640";
  const dirEmpresa = infoEmpresa?.direccion || "BENI Nº 343 ZONA: CEMENTERIO - VILLAZON";
  const pautEmpresa = infoEmpresa?.num_paut || "52868";
  const permisoEmpresa = infoEmpresa?.num_permiso_internacional || "13311C13029";
  const correoEmpresa = infoEmpresa?.correo || "yurianasrltransporte@gmail.com";
  const logoEmpresa = infoEmpresa?.logo_url || "/logo-yuriana.png";

  return (
    <Document title={`Reporte_${tracto.placa}`}>
      <Page size="LETTER" style={styles.page}>
        
        {/* ENCABEZADO CORPORATIVO */}
        <View style={styles.headerBox}>
          <View style={styles.logoBox}>
            <Image src={logoEmpresa} style={styles.logo} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{nombreEmpresa}</Text>
            <Text style={styles.headerSubtitle}>TRANSPORTE DE CARGA NACIONAL E INTERNACIONAL</Text>
          </View>
        </View>

        {/* SECCIÓN ADUANERA DINÁMICA (Solo Internacional) */}
        {tipoFormato === "internacional" && (
          <View style={styles.table}>
            <View style={styles.tableRow}><Text style={styles.cellLabel}>Nombre de la Empresa</Text><Text style={styles.cellValueFull}>{nombreEmpresa}</Text></View>
            <View style={styles.tableRow}><Text style={styles.cellLabel}>Celular - Whatsapp</Text><Text style={styles.cellValueFull}>{telfEmpresa}</Text></View>
            <View style={styles.tableRow}><Text style={styles.cellLabel}>Correo Electrónico</Text><Text style={styles.cellValueEmail}>{correoEmpresa}</Text></View>
            <View style={styles.tableRow}><Text style={styles.cellLabel}>Dirección</Text><Text style={styles.cellValueFull}>{dirEmpresa}</Text></View>
            <View style={styles.tableRow}><Text style={styles.cellLabel}>Nit de la Empresa</Text><Text style={styles.cellValueFull}>{nitEmpresa}</Text></View>
            <View style={styles.tableRow}><Text style={styles.cellLabel}>Nro de Paut</Text><Text style={styles.cellValueFull}>{pautEmpresa}</Text></View>
            <View style={styles.tableRowLast}><Text style={styles.cellLabel}>Permiso Internacional Nro.</Text><Text style={styles.cellValueFull}>{permisoEmpresa}</Text></View>
          </View>
        )}

        {/* SECCIÓN: DATOS DEL CONDUCTOR */}
        <Text style={styles.sectionBanner}>Datos del Conductor</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}><Text style={styles.cellLabel}>Nombre</Text><Text style={styles.cellValueFull}>{conductor.nombre}</Text></View>
          <View style={styles.tableRowLast}><Text style={styles.cellLabel}>Nro. Licencia o C.I.</Text><Text style={styles.cellValueFull}>{conductor.ci}</Text></View>
        </View>

        {/* SECCIÓN: DATOS DE LA UNIDAD */}
        <Text style={styles.sectionBanner}>Datos de la Unidad</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabelSub}>Concepto</Text>
            <Text style={styles.cellValueHalfLeft}>Tracto</Text>
            <Text style={styles.cellValueHalfRight}>Semiremolque</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabelSub}>Placa o Dominio</Text>
            <Text style={styles.cellValueHalfLeft}>{tracto.placa}</Text>
            <Text style={styles.cellValueHalfRight}>{remolque.placa}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabelSub}>Color</Text>
            <Text style={styles.cellValueHalfLeft}>{tracto.color}</Text>
            <Text style={styles.cellValueHalfRight}>{remolque.color}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabelSub}>Marca</Text>
            <Text style={styles.cellValueHalfLeft}>{tracto.marca}</Text>
            <Text style={styles.cellValueHalfRight}>{remolque.marca}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabelSub}>Modelo</Text>
            <Text style={styles.cellValueHalfLeft}>{tracto.modelo || "--"}</Text>
            <Text style={styles.cellValueHalfRight}>{remolque.modelo || "--"}</Text>
          </View>

          <View style={tipoFormato === "nacional" ? styles.tableRowLast : styles.tableRow}>
            <Text style={styles.cellLabelSub}>Año</Text>
            <Text style={styles.cellValueHalfLeft}>{tracto.anio || "--"}</Text>
            <Text style={styles.cellValueHalfRight}>{remolque.anio || "--"}</Text>
          </View>

          {/* EXTENSIÓN INTERNACIONAL CON LOS NUEVOS CAMPOS DEL TRACTO */}
          {tipoFormato === "internacional" && (
            <>
              <View style={styles.tableRow}>
                <Text style={styles.cellLabelSub}>Chasis Nro.</Text>
                <Text style={styles.cellValueHalfLeft}>{tracto.num_chasis || "--"}</Text>
                <Text style={styles.cellValueHalfRight}>--</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.cellLabelSub}>Nro de Poliza de Seguro</Text>
                <Text style={styles.cellValueHalfLeft}>{tracto.num_poliza || "PENDIENTE"}</Text>
                <Text style={styles.cellValueHalfRight}>--</Text>
              </View>
              {/* Fila Vencimiento de Póliza */}
                <View style={styles.tableRowLast}>
                <Text style={styles.cellLabelSub}>Vencimiento Poliza</Text>
                <Text style={styles.cellValueHalfLeft}>{fechaVencimientoPoliza}</Text>
                <Text style={styles.cellValueHalfRight}>--</Text>
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};