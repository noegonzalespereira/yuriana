"use client";
import { useState, useEffect, useCallback } from "react";
import { FileCheck, Download, Receipt, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { getFacturas, getTotalesFacturacion } from "@/lib/api/facturacion.api";
import { getCategorias } from "@/lib/api/requisito.api";
import { FacturaItem, TotalesFacturacion, FacturacionFilters } from "@/types/facturacion.types";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const fmtFecha = (iso: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const tipoViajeLabel = (tipo: string) => {
  if (tipo?.includes("INTERNACIONAL")) return "Internacional";
  if (tipo?.includes("NACIONAL")) return "Nacional";
  return tipo ?? "-";
};

const PAGE_SIZE = 10;

// ── Helpers para rango del mes actual ────────────────────────────────────────
const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);

// ── Exportar CSV ─────────────────────────────────────────────────────────────
const exportarCSV = (data: FacturaItem[], totales: TotalesFacturacion) => {
  const filas = [
    ["ID Viaje", "Factura de Transporte", "Tipo de Viaje", "Fecha Emisión", "Monto (Bs)"],
    ...data.map((f) => [
      f.servicio?.codigo_servicio ?? "-",
      f.factura_transporte,
      tipoViajeLabel(f.servicio?.categoria?.tipo_categoria),
      fmtFecha(f.fecha_emision),
      Number(f.monto_factura).toFixed(2),
    ]),
    [],
    ["", "", "", "TOTAL FACTURADO", totales.total_facturado.toFixed(2)],
    ["", "", "", "IMPUESTO IT (3%)", totales.impuesto_it.toFixed(2)],
  ];
  const csv = filas.map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facturacion_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function FacturacionPage() {
  const [loading, setLoading] = useState(true);
  const [facturas, setFacturas] = useState<FacturaItem[]>([]);
  const [totales, setTotales] = useState<TotalesFacturacion>({ total_facturado: 0, impuesto_it: 0 });
  const [categorias, setCategorias] = useState<{ id_categoria: number; tipo_categoria: string }[]>([]);
  const [pagina, setPagina] = useState(1);

  const INITIAL_FILTERS: FacturacionFilters = {
    fecha_inicio: primerDiaMes,
    fecha_fin: ultimoDiaMes,
    id_categoria: "",
  };

  const [filters, setFilters] = useState<FacturacionFilters>(INITIAL_FILTERS);
  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [lista, tots] = await Promise.all([
        getFacturas(filters),
        getTotalesFacturacion(filters),
      ]);
      setFacturas(lista);
      setTotales(tots);
      setPagina(1);
    } catch {
      toast.error("Error al cargar la facturación");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    getCategorias()
      .then((cats) =>
        setCategorias(
          cats.filter((c) => ["VIAJE_INTERNACIONAL", "VIAJE_NACIONAL"].includes(c.tipo_categoria))
        )
      )
      .catch(() => {});
  }, []);

  // ── Paginación ───────────────────────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(facturas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = facturas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const INPUT_DATE =
    "border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";
  const SELECT_CLASS =
    "border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ModuleHeader
        title="Gestión de Facturación"
        subtitle="Registro y control del impuesto IT mensual (3%)"
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Facturado"
          value={`${fmt(totales.total_facturado)} Bs`}
          icon={<Receipt size={22} />}
          borderColor="border-[var(--yuriana-card-border)]"
          iconBg="bg-orange-50"
          iconColor="text-[var(--yuriana-base-orange)]"
        />
        <StatCard
          label="Impuesto Estimado (3% IT)"
          value={`${fmt(totales.impuesto_it)} Bs`}
          icon={<TrendingUp size={22} />}
          borderColor="border-amber-200"
          iconBg="bg-amber-50"
          iconColor="text-[var(--yuriana-base-yellow)]"
        />
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-end gap-3 px-6 py-5 border-b border-border">
          {/* Fecha inicio */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Fecha Inicio</span>
            <input
              type="date"
              value={filters.fecha_inicio ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, fecha_inicio: e.target.value }))}
              className={INPUT_DATE}
            />
          </div>

          {/* Fecha fin */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Fecha Fin</span>
            <input
              type="date"
              value={filters.fecha_fin ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, fecha_fin: e.target.value }))}
              className={INPUT_DATE}
            />
          </div>

          {/* Tipo de viaje */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Tipo de Viaje</span>
            <select
              value={filters.id_categoria ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, id_categoria: e.target.value }))}
              className={SELECT_CLASS}
            >
              <option value="">Todos</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={String(c.id_categoria)}>
                  {tipoViajeLabel(c.tipo_categoria)}
                </option>
              ))}
            </select>
          </div>

          {/* Restablecer filtros */}
          <ResetFiltersButton onClick={handleResetFilters} />

          {/* Exportar */}
          <button
            type="button"
            onClick={() => exportarCSV(facturas, totales)}
            disabled={facturas.length === 0}
            className="ml-auto flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black py-2 px-5 rounded-xl shadow text-xs transition-all active:scale-95 disabled:opacity-40"
          >
            <Download size={13} />
            Exportar
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--yuriana-base-orange)] text-white">
                {["ID Viaje", "Factura de Transporte", "Tipo Viaje", "Fecha Emisión", "Monto"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-left font-black uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic font-medium">
                    Cargando registros...
                  </td>
                </tr>
              ) : registrosPagina.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic font-medium uppercase tracking-wide text-[10px]">
                    No se encontraron registros de facturación.
                  </td>
                </tr>
              ) : (
                registrosPagina.map((f, i) => (
                  <tr
                    key={f.id_factura}
                    className={`border-b border-border transition-colors hover:bg-orange-50/30 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-[var(--yuriana-base-gray-dark)]">
                      {f.servicio?.codigo_servicio ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-[var(--yuriana-input-text)]">
                      {f.factura_transporte}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        f.servicio?.categoria?.tipo_categoria?.includes("INTERNACIONAL")
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-green-50 text-green-600 border border-green-100"
                      }`}>
                        {tipoViajeLabel(f.servicio?.categoria?.tipo_categoria)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--yuriana-input-text)]">
                      {fmtFecha(f.fecha_emision)}
                    </td>
                    <td className="px-5 py-4 font-black text-[var(--yuriana-base-orange)]">
                      {fmt(Number(f.monto_factura))} Bs
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-[var(--yuriana-input-placeholder)] font-medium">
            Mostrando {registrosPagina.length} de {facturas.length} registro{facturas.length !== 1 ? "s" : ""}
          </p>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-xs font-bold text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)] disabled:opacity-30 transition-all"
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[var(--yuriana-input-placeholder)]">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPagina(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-black transition-all ${
                        paginaActual === p
                          ? "bg-[var(--yuriana-base-orange)] text-white border-[var(--yuriana-base-orange)] shadow"
                          : "border-border text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-xs font-bold text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)] hover:text-[var(--yuriana-base-orange)] disabled:opacity-30 transition-all"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
