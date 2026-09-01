"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, Receipt, TrendingUp, Eye, Pencil, Trash2, X, AlertTriangle, Loader2, Plus, FileText, Image as ImageIcon } from "lucide-react";
import { TableActions } from "@/components/atoms/TableActions";
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
import { DateRangeFilter } from "@/components/molecules/DateRangeFilter";
import { FacturaItem, TotalesFacturacion, FacturacionFilters } from "@/types/facturacion.types";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const parseFechaNegocio = (value: string) => {
  if (!value) return null;

  const [fechaBase] = value.split("T");
  const [year, month, day] = (fechaBase || value).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

const fmtFecha = (iso: string) => {
  if (!iso) return "-";

  const date = parseFechaNegocio(iso) ?? new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const tipoViajeLabel = (tipo: string) => {
  if (tipo?.includes("INTERNACIONAL")) return "Internacional";
  if (tipo?.includes("NACIONAL")) return "Nacional";
  return tipo ?? "-";
};

const esPdf = (url: string) => /\.pdf($|\?)/i.test(url);

const PAGE_SIZE = 10;

const hoy = new Date();
const toDateInputLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const primerDiaMes = toDateInputLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
const ultimoDiaMes = toDateInputLocal(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));

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

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedFactura, setSelectedFactura] = useState<FacturaItem | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form fields
  const [editFacturaTransporte, setEditFacturaTransporte] = useState("");
  const [editMonto, setEditMonto] = useState("");

  // Gallery edit state
  const [eliminarFotoPrincipal, setEliminarFotoPrincipal] = useState(false);
  const [fotosEliminadas, setFotosEliminadas] = useState<number[]>([]);
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
  const [previewsNuevos, setPreviewsNuevos] = useState<string[]>([]);

  // Lightbox
  const [fotoExpandidaUrl, setFotoExpandidaUrl] = useState<string | null>(null);

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

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const abrirModal = async (tipo: ModalType, factura: FacturaItem) => {
    setLoadingModal(true);
    try {
      const data = await getFactura(factura.id_factura);
      setSelectedFactura(data);
      if (tipo === "editar") {
        setEditFacturaTransporte(data.factura_transporte ?? "");
        setEditMonto(String(data.monto_factura ?? ""));
        setEliminarFotoPrincipal(false);
        setFotosEliminadas([]);
        setArchivosNuevos([]);
        setPreviewsNuevos([]);
      }
      setModalType(tipo);
    } catch {
      toast.error("No se pudo cargar la factura");
    } finally {
      setLoadingModal(false);
    }
  };

  const cerrarModal = () => {
    previewsNuevos.forEach((p) => URL.revokeObjectURL(p));
    setModalType(null);
    setSelectedFactura(null);
    setEliminarFotoPrincipal(false);
    setFotosEliminadas([]);
    setArchivosNuevos([]);
    setPreviewsNuevos([]);
  };

  // Gallery helpers
  const fotosExistentesVisibles = (() => {
    if (!selectedFactura) return [];
    return (selectedFactura.fotos ?? []).filter((f) => !fotosEliminadas.includes(f.id_foto_factura));
  })();

  const totalFotos = (eliminarFotoPrincipal || !selectedFactura?.foto_factura ? 0 : 1)
    + fotosExistentesVisibles.length
    + archivosNuevos.length;

  const handleAgregarArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const disponibles = 10 - totalFotos;
    if (disponibles <= 0) {
      toast.error("Límite alcanzado: máximo 10 archivos por factura");
      return;
    }
    const nuevos = files.slice(0, disponibles);
    const previews = nuevos.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
    );
    setArchivosNuevos((prev) => [...prev, ...nuevos]);
    setPreviewsNuevos((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleQuitarNuevo = (index: number) => {
    if (previewsNuevos[index]) URL.revokeObjectURL(previewsNuevos[index]);
    setArchivosNuevos((prev) => prev.filter((_, i) => i !== index));
    setPreviewsNuevos((prev) => prev.filter((_, i) => i !== index));
  };

  const abrirFoto = (url: string) => {
    if (esPdf(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setFotoExpandidaUrl(url);
    }
  };

  const handleEditar = async (e: React.FormEvent<HTMLFormElement>) => {
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
      if (eliminarFotoPrincipal) fd.append("eliminar_foto_principal", "true");
      if (fotosEliminadas.length > 0) fd.append("ids_fotos_eliminar", fotosEliminadas.join(","));
      archivosNuevos.forEach((f) => fd.append("fotos_nuevas", f));
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
      toast.error("Acción denegada", { description: err.message || "Error al eliminar la factura." });
    } finally {
      setSaving(false);
    }
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(facturas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = facturas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const INPUT_DATE =
    "border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

  const INPUT_FIELD =
    "w-full border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-xs bg-[var(--yuriana-input-bg)] text-[var(--yuriana-input-text)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

  const LABEL_CLASS = "text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]";

  // ── Foto card helpers ───────────────────────────────────────────────────────
  const FotoCard = ({
    url,
    label,
    badge,
    onRemove,
    onClick,
    isNew = false,
  }: {
    url: string;
    label?: string;
    badge?: React.ReactNode;
    onRemove?: () => void;
    onClick?: () => void;
    isNew?: boolean;
  }) => {
    const pdf = !url || esPdf(url) || esPdf(label ?? "");
    return (
      <div
        className={`relative aspect-square rounded-2xl overflow-hidden group shadow-sm cursor-pointer hover:shadow-md transition-all ${
          isNew ? "border-2 border-blue-200" : "border border-border"
        }`}
        onClick={onClick}
      >
        {pdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 gap-2 p-2">
            <FileText size={28} className="text-red-400" />
            <span className="text-[9px] font-black text-red-500 uppercase text-center leading-tight truncate w-full text-center px-1">
              {label ?? "PDF"}
            </span>
          </div>
        ) : (
          <img
            src={url}
            alt={label ?? "foto"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Error";
            }}
          />
        )}

        {badge && (
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50">
            {badge}
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {pdf ? (
            <span className="text-[9px] text-white font-black uppercase">Abrir PDF</span>
          ) : (
            <Eye size={18} className="text-white" />
          )}
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors z-10 opacity-0 group-hover:opacity-100"
          >
            <X size={11} />
          </button>
        )}

        {isNew && (
          <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
            Nueva
          </div>
        )}
      </div>
    );
  };

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
          <DateRangeFilter
            fechaInicio={filters.fecha_inicio ?? ""}
            fechaFin={filters.fecha_fin ?? ""}
            onFechaInicioChange={(val) => setFilters((f) => ({ ...f, fecha_inicio: val }))}
            onFechaFinChange={(val) => setFilters((f) => ({ ...f, fecha_fin: val }))}
            labelClass={LABEL_CLASS}
            inputClass={INPUT_DATE}
          />
          <div className="flex flex-col gap-1">
            <span className={LABEL_CLASS}>Tipo de Viaje</span>
            <FilterSelect
              placeholder="Tipo de Viaje"
              value={filters.id_categoria ?? ""}
              options={categorias.map((c) => ({
                value: String(c.id_categoria),
                label: tipoViajeLabel(c.tipo_categoria),
              }))}
              onChange={(v) => setFilters((f) => ({ ...f, id_categoria: v }))}
            />
          </div>
          <ResetFiltersButton onClick={handleResetFilters} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--yuriana-base-orange)] text-white">
                {["#", "ID Viaje", "Factura de Transporte", "Tipo Viaje", "Fecha Emisión", "Monto", "IT Individual", "Acciones"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-left font-black uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? ( // Ajustar colSpan para la nueva columna
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic font-medium">
                    Cargando registros...
                  </td>
                </tr>
              ) : registrosPagina.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[var(--yuriana-input-placeholder)] italic font-medium uppercase tracking-wide text-[10px]">
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
                    <td className="px-5 py-4 text-center font-bold text-slate-400">{i + 1}</td>
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
                    <td className="px-5 py-4 font-black text-blue-600">
                      {fmt(Number(f.monto_factura) * 0.03)} Bs
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <TableActions
                          disabled={loadingModal}
                          onView={() => abrirModal("ver", f)}
                          onEdit={() => abrirModal("editar", f)}
                          onDelete={() => abrirModal("eliminar", f)}
                          size={16}
                        />
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL OVERLAY                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          {/* ── VER ──────────────────────────────────────────────────────── */}
          {modalType === "ver" && selectedFactura && (() => {
            const fotos: { url: string; label: string; isPrincipal?: boolean }[] = [];
            if (selectedFactura.foto_factura) fotos.push({ url: selectedFactura.foto_factura, label: esPdf(selectedFactura.foto_factura) ? "PDF Principal" : "Foto Principal", isPrincipal: true });
            (selectedFactura.fotos ?? []).forEach((f, i) => fotos.push({ url: f.url_foto, label: esPdf(f.url_foto) ? `PDF ${i + 1}` : `Foto ${i + 1}` }));
            return (
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 bg-[var(--yuriana-base-orange)] text-white flex-shrink-0">
                  <h2 className="font-black text-sm uppercase tracking-wider">Detalle de Factura</h2>
                  <button type="button" onClick={cerrarModal} className="hover:opacity-70 transition-opacity">
                    <X size={16} />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                  {/* Info */}
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

                  {/* Gallery */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 border-b border-border pb-3">
                      <ImageIcon size={15} className="text-[var(--yuriana-base-orange)]" />
                      <p className={LABEL_CLASS}>Archivos adjuntos ({fotos.length})</p>
                    </div>
                    {fotos.length === 0 ? (
                      <div className="py-8 text-center text-[var(--yuriana-input-placeholder)] italic text-[11px] border border-dashed border-border rounded-2xl bg-slate-50/50">
                        Sin archivos adjuntos
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {fotos.map((foto, i) => (
                          <FotoCard
                            key={i}
                            url={foto.url}
                            label={foto.label}
                            onClick={() => abrirFoto(foto.url)}
                            badge={
                              foto.isPrincipal ? (
                                <span className="text-[8px] text-amber-300 font-black uppercase">⭐ Principal</span>
                              ) : undefined
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end px-6 py-4 border-t border-border flex-shrink-0">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--yuriana-input-text)] text-xs font-black transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ── EDITAR ─────────────────────────────────────────────────── */}
          {modalType === "editar" && selectedFactura && (
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 bg-[var(--yuriana-base-orange)] text-white flex-shrink-0">
                <h2 className="font-black text-sm uppercase tracking-wider">Editar Factura</h2>
                <button type="button" onClick={cerrarModal} className="hover:opacity-70 transition-opacity">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditar} className="overflow-y-auto flex flex-col flex-1">
                <div className="p-6 space-y-5">
                  {/* Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className={LABEL_CLASS}>ID Viaje</label>
                      <p className="text-xs font-bold text-[var(--yuriana-base-gray-dark)]">
                        {selectedFactura.servicio?.codigo_servicio ?? "-"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={LABEL_CLASS}>Fecha Emisión</label>
                      <p className="text-xs font-semibold text-[var(--yuriana-input-text)]">
                        {fmtFecha(selectedFactura.fecha_emision)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
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
                    <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
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
                  </div>

                  {/* Gallery edit */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={15} className="text-[var(--yuriana-base-orange)]" />
                        <p className={LABEL_CLASS}>Archivos adjuntos ({totalFotos}/10)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {/* Foto principal */}
                      {selectedFactura.foto_factura && !eliminarFotoPrincipal && (
                        <FotoCard
                          url={selectedFactura.foto_factura}
                          label="Principal"
                          onClick={() => abrirFoto(selectedFactura.foto_factura!)}
                          onRemove={() => setEliminarFotoPrincipal(true)}
                          badge={<span className="text-[8px] text-amber-300 font-black uppercase">⭐ Principal</span>}
                        />
                      )}

                      {/* Fotos adicionales existentes */}
                      {fotosExistentesVisibles.map((foto) => (
                        <FotoCard
                          key={foto.id_foto_factura}
                          url={foto.url_foto}
                          label={esPdf(foto.url_foto) ? "PDF" : "Foto"}
                          onClick={() => abrirFoto(foto.url_foto)}
                          onRemove={() => setFotosEliminadas((prev) => [...prev, foto.id_foto_factura])}
                        />
                      ))}

                      {/* Nuevas en cola */}
                      {archivosNuevos.map((archivo, i) => (
                        <FotoCard
                          key={`new-${i}`}
                          url={previewsNuevos[i] || ""}
                          label={archivo.name}
                          isNew
                          onClick={() => previewsNuevos[i] ? setFotoExpandidaUrl(previewsNuevos[i]) : undefined}
                          onRemove={() => handleQuitarNuevo(i)}
                        />
                      ))}

                      {/* Botón agregar */}
                      {totalFotos < 10 && (
                        <label className="border-2 border-dashed border-[var(--yuriana-base-orange)] rounded-2xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-orange-50/50 transition-all gap-1.5 text-center text-[var(--yuriana-input-placeholder)]">
                          <Plus size={22} className="text-[var(--yuriana-base-orange)]" />
                          <span className="text-[9px] font-bold uppercase tracking-tight text-[var(--yuriana-base-orange)]">Agregar</span>
                          <span className="text-[8px]">({totalFotos}/10)</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleAgregarArchivos}
                            disabled={saving}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0">
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

          {/* ── ELIMINAR ───────────────────────────────────────────────── */}
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

      {/* ── LIGHTBOX ──────────────────────────────────────────────────────────── */}
      {fotoExpandidaUrl && (
        <div
          onClick={() => setFotoExpandidaUrl(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full mx-4 p-2 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setFotoExpandidaUrl(null)}
              className="absolute -top-12 right-2 bg-white/10 hover:bg-white/20 text-white rounded-xl p-2 transition-colors border border-white/20"
            >
              <X size={20} />
            </button>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src={fotoExpandidaUrl}
                alt="Vista detallada"
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[80vh] object-contain select-none cursor-default"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
