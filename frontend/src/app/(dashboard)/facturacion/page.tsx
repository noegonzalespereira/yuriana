"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Download, Receipt, TrendingUp, Eye, Pencil, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { StatCard } from "@/components/atoms/StatCard";
import { ResetFiltersButton } from "@/components/atoms/ResetFiltersButton";
import { FilterSelect } from "@/components/atoms/FilterSelect";
import {
  getFacturas, getTotalesFacturacion,
  getFactura, updateFactura, deleteFactura,
} from "@/lib/api/facturacion.api";
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

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);

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

type ModalType = "ver" | "editar" | "eliminar" | null;

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

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedFactura, setSelectedFactura] = useState<FacturaItem | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form fields
  const [editFacturaTransporte, setEditFacturaTransporte] = useState("");
  const [editMonto, setEditMonto] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    getCategorias()
      .then((cats) =>
        setCategorias(cats.filter((c) => ["VIAJE_INTERNACIONAL", "VIAJE_NACIONAL"].includes(c.tipo_categoria)))
      )
      .catch(() => {});
  }, []);

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const abrirModal = async (tipo: ModalType, factura: FacturaItem) => {
    setLoadingModal(true);
    try {
      const data = await getFactura(factura.id_factura);
      setSelectedFactura(data);
      if (tipo === "editar") {
        setEditFacturaTransporte(data.factura_transporte ?? "");
        setEditMonto(String(data.monto_factura ?? ""));
        setEditFile(null);
      }
      setModalType(tipo);
    } catch {
      toast.error("No se pudo cargar la factura");
    } finally {
      setLoadingModal(false);
    }
  };

  const cerrarModal = () => {
    setModalType(null);
    setSelectedFactura(null);
    setEditFile(null);
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactura) return;
    if (!editFacturaTransporte.trim()) return toast.error("El número de factura es obligatorio");
    const montoNum = parseFloat(editMonto);
    if (isNaN(montoNum) || montoNum <= 0) return toast.error("El monto debe ser mayor a 0");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("factura_transporte", editFacturaTransporte.trim());
      fd.append("monto_factura", String(montoNum));
      if (editFile) fd.append("foto_factura", editFile);
      await updateFactura(selectedFactura.id_factura, fd);
      toast.success("Factura actualizada correctamente");
      cerrarModal();
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la factura");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!selectedFactura) return;
    setSaving(true);
    try {
      await deleteFactura(selectedFactura.id_factura);
      toast.success("Factura eliminada correctamente");
      cerrarModal();
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar la factura");
    } finally {
      setSaving(false);
    }
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(facturas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = facturas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const INPUT_DATE =
    "border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

  const INPUT_FIELD =
    "w-full border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

  const LABEL_CLASS = "text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]";

  // ── Fotos helper ───────────────────────────────────────────────────────────
  const todasLasFotos = (() => {
    if (!selectedFactura) return [];
    const result: { url: string; label: string }[] = [];
    if (selectedFactura.foto_factura) result.push({ url: selectedFactura.foto_factura, label: "Foto factura" });
    (selectedFactura.fotos ?? []).forEach((f, i) => result.push({ url: f.url_foto, label: `Foto ${i + 1}` }));
    return result;
  })();

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
          <div className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Fecha Inicio</span>
            <input
              type="date"
              value={filters.fecha_inicio ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, fecha_inicio: e.target.value }))}
              className={INPUT_DATE}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Fecha Fin</span>
            <input
              type="date"
              value={filters.fecha_fin ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, fecha_fin: e.target.value }))}
              className={INPUT_DATE}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Tipo de Viaje</span>
            <FilterSelect
              placeholder="Todos"
              value={filters.id_categoria ?? ""}
              options={categorias.map((c) => ({
                value: String(c.id_categoria),
                label: tipoViajeLabel(c.tipo_categoria),
              }))}
              onChange={(v) => setFilters((f) => ({ ...f, id_categoria: v }))}
            />
          </div>
          <ResetFiltersButton onClick={handleResetFilters} />
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
                {["ID Viaje", "Factura de Transporte", "Tipo Viaje", "Fecha Emisión", "Monto", "Acciones"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-left font-black uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic font-medium">
                    Cargando registros...
                  </td>
                </tr>
              ) : registrosPagina.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic font-medium uppercase tracking-wide text-[10px]">
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
                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={loadingModal}
                          onClick={() => abrirModal("ver", f)}
                          title="Ver detalles"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors text-[10px] font-black disabled:opacity-40"
                        >
                          <Eye size={11} /> Ver
                        </button>
                        <button
                          type="button"
                          disabled={loadingModal}
                          onClick={() => abrirModal("editar", f)}
                          title="Editar factura"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-colors text-[10px] font-black disabled:opacity-40"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                        <button
                          type="button"
                          disabled={loadingModal}
                          onClick={() => abrirModal("eliminar", f)}
                          title="Eliminar factura"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors text-[10px] font-black disabled:opacity-40"
                        >
                          <Trash2 size={11} /> Eliminar
                        </button>
                      </div>
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL OVERLAY                                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          {/* ── VER ─────────────────────────────────────────────────────── */}
          {modalType === "ver" && selectedFactura && (
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-[var(--yuriana-base-orange)] text-white">
                <h2 className="font-black text-sm uppercase tracking-wider">Detalle de Factura</h2>
                <button type="button" onClick={cerrarModal} className="hover:opacity-70 transition-opacity">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={LABEL_CLASS}>ID Viaje</p>
                    <p className="text-xs font-bold text-[var(--yuriana-base-gray-dark)] mt-1">
                      {selectedFactura.servicio?.codigo_servicio ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className={LABEL_CLASS}>Tipo de Viaje</p>
                    <p className="text-xs font-semibold text-[var(--yuriana-input-text)] mt-1">
                      {tipoViajeLabel(selectedFactura.servicio?.categoria?.tipo_categoria)}
                    </p>
                  </div>
                  <div>
                    <p className={LABEL_CLASS}>N° Factura de Transporte</p>
                    <p className="text-xs font-semibold text-[var(--yuriana-input-text)] mt-1">
                      {selectedFactura.factura_transporte}
                    </p>
                  </div>
                  <div>
                    <p className={LABEL_CLASS}>Fecha Emisión</p>
                    <p className="text-xs font-semibold text-[var(--yuriana-input-text)] mt-1">
                      {fmtFecha(selectedFactura.fecha_emision)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className={LABEL_CLASS}>Monto Facturado</p>
                    <p className="text-sm font-black text-[var(--yuriana-base-orange)] mt-1">
                      {fmt(Number(selectedFactura.monto_factura))} Bs
                    </p>
                  </div>
                </div>

                {todasLasFotos.length > 0 && (
                  <div>
                    <p className={`${LABEL_CLASS} mb-2`}>Fotos de Factura</p>
                    <div className="flex flex-wrap gap-2">
                      {todasLasFotos.map((foto, i) => (
                        <a
                          key={i}
                          href={foto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors text-[10px] font-black"
                        >
                          <Eye size={11} /> {foto.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--yuriana-input-text)] text-xs font-black transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── EDITAR ──────────────────────────────────────────────────── */}
          {modalType === "editar" && selectedFactura && (
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-[var(--yuriana-base-orange)] text-white">
                <h2 className="font-black text-sm uppercase tracking-wider">Editar Factura</h2>
                <button type="button" onClick={cerrarModal} className="hover:opacity-70 transition-opacity">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleEditar} className="p-6 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>ID Viaje</label>
                  <p className="text-xs font-bold text-[var(--yuriana-base-gray-dark)]">
                    {selectedFactura.servicio?.codigo_servicio ?? "-"}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>N° Factura de Transporte *</label>
                  <input
                    type="text"
                    value={editFacturaTransporte}
                    onChange={(e) => setEditFacturaTransporte(e.target.value)}
                    className={INPUT_FIELD}
                    placeholder="Ej. 0001"
                    disabled={saving}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Monto Facturado (Bs) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editMonto}
                    onChange={(e) => setEditMonto(e.target.value)}
                    className={INPUT_FIELD}
                    placeholder="0.00"
                    disabled={saving}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Reemplazar foto de factura (opcional)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                    className="text-xs text-[var(--yuriana-input-text)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-[var(--yuriana-base-orange)] file:text-white hover:file:opacity-90"
                    disabled={saving}
                  />
                  {editFile && (
                    <p className="text-[10px] text-[var(--yuriana-input-placeholder)]">{editFile.name}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--yuriana-input-text)] text-xs font-black transition-colors disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--yuriana-base-orange)] hover:opacity-90 text-white text-xs font-black transition-all active:scale-95 disabled:opacity-40"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />}
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── ELIMINAR ────────────────────────────────────────────────── */}
          {modalType === "eliminar" && selectedFactura && (
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-rose-500 text-white">
                <h2 className="font-black text-sm uppercase tracking-wider">Eliminar Factura</h2>
                <button type="button" onClick={cerrarModal} className="hover:opacity-70 transition-opacity">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                    Al eliminar esta factura, se desvinculará permanentemente del viaje{" "}
                    <span className="font-black">{selectedFactura.servicio?.codigo_servicio ?? ""}</span>.
                    Esta acción no se puede deshacer.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className={LABEL_CLASS}>N° Factura</p>
                    <p className="font-bold text-[var(--yuriana-base-gray-dark)] mt-0.5">
                      {selectedFactura.factura_transporte}
                    </p>
                  </div>
                  <div>
                    <p className={LABEL_CLASS}>Monto</p>
                    <p className="font-black text-[var(--yuriana-base-orange)] mt-0.5">
                      {fmt(Number(selectedFactura.monto_factura))} Bs
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--yuriana-input-text)] text-xs font-black transition-colors disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleEliminar}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all active:scale-95 disabled:opacity-40"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    {saving ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
