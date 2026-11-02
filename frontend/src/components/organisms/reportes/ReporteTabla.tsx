// src/components/organisms/reportes/ReporteTabla.tsx
// Reporte PDF genérico (cabecera + datos + tabla + total) para Gastos, Ingresos extra y Facturas.
"use client";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { Empresa } from "@/types/empresa.types";
import { BarrasDecorativas, CabeceraReporte, InfoEmpresaBox, estilos } from "./reporteBase";

export interface ColumnaReporte {
  titulo: string;
  /** Ancho en % (la columna N° se agrega aparte con 5%; el resto debe sumar 95). */
  ancho: number;
  align?: "left" | "right" | "center";
}

export interface SeccionReporte {
  titulo?: string;
  filas: string[][];
  /** Fila de totales con una celda por columna (sin la columna N°). */
  totalFila?: string[];
}

interface Props {
  titulo: string;
  nombreArchivo: string;
  columnas: ColumnaReporte[];
  secciones: SeccionReporte[];
  /** Líneas de la caja "Datos del reporte". */
  datos: string[];
  /** Fila de total general (solo cuando hay varias secciones). */
  totalGeneral?: string[];
  infoEmpresa: Empresa | null;
  orientacion?: "portrait" | "landscape";
}

export const ReporteTabla = ({
  titulo, nombreArchivo, columnas, secciones, datos, totalGeneral, infoEmpresa, orientacion = "landscape",
}: Props) => {
  const anchoN = "5%";
  const filaTotal = (celdas: string[], clave: string) => (
    <View key={clave} style={estilos.totalRow} wrap={false}>
      <Text style={[estilos.cell, { width: anchoN }]}> </Text>
      {columnas.map((c, i) => (
        <Text
          key={i}
          style={[
            estilos.cell,
            { width: `${c.ancho}%`, fontWeight: "bold", textAlign: c.align ?? "left" },
            i === columnas.length - 1 ? { borderRightWidth: 0 } : {},
          ]}
        >
          {celdas[i] ?? ""}
        </Text>
      ))}
    </View>
  );

  return (
    <Document title={nombreArchivo}>
      <Page size="LETTER" orientation={orientacion} style={estilos.page}>
        <BarrasDecorativas />
        <CabeceraReporte infoEmpresa={infoEmpresa} subtitulo={titulo} />

        <View style={estilos.infoRow}>
          <InfoEmpresaBox infoEmpresa={infoEmpresa} />
          <View style={estilos.infoBox}>
            <Text style={estilos.infoTitle}>DATOS DEL REPORTE</Text>
            {datos.map((d, i) => <Text key={i} style={estilos.infoText}>{d}</Text>)}
          </View>
        </View>

        {secciones.map((sec, si) => (
          <View key={si}>
            {sec.titulo ? <Text style={estilos.seccionTitulo}>{sec.titulo}</Text> : null}
            <View fixed={si === 0} style={estilos.tableHead}>
              <Text style={[estilos.cellHead, { width: anchoN }]}>N°</Text>
              {columnas.map((c, i) => (
                <Text key={i} style={[estilos.cellHead, { width: `${c.ancho}%` }]}>{c.titulo}</Text>
              ))}
            </View>
            {sec.filas.map((fila, fi) => (
              <View key={fi} style={estilos.row} wrap={false}>
                <Text style={[estilos.cell, { width: anchoN, textAlign: "center" }]}>{fi + 1}</Text>
                {columnas.map((c, i) => (
                  <Text
                    key={i}
                    style={[
                      estilos.cell,
                      { width: `${c.ancho}%`, textAlign: c.align ?? "left" },
                      i === columnas.length - 1 ? { borderRightWidth: 0 } : {},
                    ]}
                  >
                    {fila[i] ?? ""}
                  </Text>
                ))}
              </View>
            ))}
            {sec.totalFila ? filaTotal(sec.totalFila, `t${si}`) : null}
          </View>
        ))}

        {totalGeneral ? <View style={{ marginTop: 10 }}>{filaTotal(totalGeneral, "tg")}</View> : null}
      </Page>
    </Document>
  );
};
