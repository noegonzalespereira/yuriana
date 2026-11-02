// src/components/organisms/reportes/ReporteEstadoResultados.tsx
"use client";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { Empresa } from "@/types/empresa.types";
import { BarrasDecorativas, CabeceraReporte, InfoEmpresaBox, estilos, fmtMonto, DARK, ORANGE } from "./reporteBase";

interface Props {
  mesLabel: string;
  anio: number;
  ingresos: { totalFletes: number; totalIngresoExtras: number; totalIngresos: number };
  gastos: {
    totalGastosViaje: number;
    totalGastosOperativos: number;
    totalGastosAdministrativos: number;
    totalGastosGenerales: number;
    totalGastos: number;
  };
  pagos: { total_cobrado: number; total_por_cobrar: number; total_retrasado: number };
  infoEmpresa: Empresa | null;
}

type Linea = { label: string; valor: number; tipo?: "total" | "utilidad" };

export const ReporteEstadoResultados = ({ mesLabel, anio, ingresos, gastos, pagos, infoEmpresa }: Props) => {
  const utilidad = ingresos.totalIngresos - gastos.totalGastos;

  const bloques: { titulo: string; lineas: Linea[] }[] = [
    {
      titulo: "INGRESOS",
      lineas: [
        { label: "Ingresos por fletes", valor: ingresos.totalFletes },
        { label: "Ingresos extras", valor: ingresos.totalIngresoExtras },
        { label: "TOTAL INGRESOS", valor: ingresos.totalIngresos, tipo: "total" },
      ],
    },
    {
      titulo: "GASTOS",
      lineas: [
        { label: "Gastos del servicio (viajes)", valor: gastos.totalGastosViaje },
        { label: "Gastos operativos", valor: gastos.totalGastosOperativos },
        { label: "Gastos administrativos", valor: gastos.totalGastosAdministrativos },
        { label: "Gastos generales", valor: gastos.totalGastosGenerales },
        { label: "TOTAL GASTOS", valor: gastos.totalGastos, tipo: "total" },
      ],
    },
    {
      titulo: "RESULTADO",
      lineas: [{ label: "UTILIDAD NETA", valor: utilidad, tipo: "utilidad" }],
    },
    {
      titulo: "COBRANZA DEL MES",
      lineas: [
        { label: "Total cobrado", valor: pagos.total_cobrado },
        { label: "Por cobrar", valor: pagos.total_por_cobrar },
        { label: "Pagos retrasados", valor: pagos.total_retrasado },
      ],
    },
  ];

  return (
    <Document title={`Estado_de_resultados_${mesLabel}_${anio}`}>
      <Page size="LETTER" style={estilos.page}>
        <BarrasDecorativas />
        <CabeceraReporte infoEmpresa={infoEmpresa} subtitulo={`ESTADO DE RESULTADOS — ${mesLabel.toUpperCase()} ${anio}`} />

        <View style={estilos.infoRow}>
          <InfoEmpresaBox infoEmpresa={infoEmpresa} />
          <View style={estilos.infoBox}>
            <Text style={estilos.infoTitle}>DATOS DEL REPORTE</Text>
            <Text style={estilos.infoText}>Período: {mesLabel} {anio}</Text>
            <Text style={estilos.infoText}>Total ingresos: {fmtMonto(ingresos.totalIngresos)} Bs</Text>
            <Text style={estilos.infoText}>Total gastos: {fmtMonto(gastos.totalGastos)} Bs</Text>
            <Text style={estilos.infoText}>Utilidad neta: {fmtMonto(utilidad)} Bs</Text>
          </View>
        </View>

        {bloques.map((bloque) => (
          <View key={bloque.titulo} wrap={false}>
            <Text style={estilos.seccionTitulo}>{bloque.titulo}</Text>
            <View style={[estilos.tableHead, { fontSize: 7 }]}>
              <Text style={[estilos.cellHead, { width: "70%", textAlign: "left" }]}>Concepto</Text>
              <Text style={[estilos.cellHead, { width: "30%", textAlign: "right" }]}>Monto Bs</Text>
            </View>
            {bloque.lineas.map((l) => {
              const destacada = l.tipo === "total" || l.tipo === "utilidad";
              const color = l.tipo === "utilidad" ? (l.valor >= 0 ? "#059669" : "#E11D48") : undefined;
              return (
                <View
                  key={l.label}
                  style={[estilos.row, destacada ? { backgroundColor: "#FFF3EC" } : {}]}
                  wrap={false}
                >
                  <Text style={[estilos.cell, { width: "70%", fontWeight: destacada ? "bold" : "normal", color: l.tipo === "utilidad" ? ORANGE : DARK }]}>
                    {l.label}
                  </Text>
                  <Text style={[estilos.cell, { width: "30%", textAlign: "right", borderRightWidth: 0, fontWeight: destacada ? "bold" : "normal", color }]}>
                    {fmtMonto(l.valor)}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
};
