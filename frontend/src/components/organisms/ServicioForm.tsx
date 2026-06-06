"use client";
import { useState, useEffect, useRef } from "react";
import { Info, MapPin, FileText, Ship, Users, Truck, UserCheck, DollarSign, Calendar, Package, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ServicioItem, Moneda, Operador } from "@/types/servicio.types";
import { crearServicio, editarServicio } from "@/lib/api/servicio.api";
import { getCategorias } from "@/lib/api/requisito.api";
import { getAsignaciones } from "@/lib/api/asignacion.api";
import { getRequisitos } from "@/lib/api/requisito.api";
import { apiFetch } from "@/lib/api";

const INPUT_CLASS =
  "w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-2 px-3 text-xs font-medium text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all disabled:opacity-60";

const LABEL_CLASS = "text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1";

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-[var(--yuriana-section-icon)]">{icon}</span>
    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--yuriana-base-gray-dark)]">{title}</h3>
    <div className="flex-1 h-px bg-[var(--yuriana-input-border)]" />
  </div>
);

const Field = ({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className={LABEL_CLASS}>
      {label}
      {required && <span className="text-[var(--yuriana-input-error)] ml-0.5">*</span>}
      {optional && <span className="text-[var(--yuriana-input-placeholder)] ml-1 normal-case font-semibold">(opcional)</span>}
    </label>
    {children}
  </div>
);

const FileUploadSlot = ({
  label, file, onChange, disabled, existingUrl, required, optional,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  disabled?: boolean;
  existingUrl?: string;
  required?: boolean;
  optional?: boolean;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const hasExisting = !!existingUrl;

  return (
    <div className="flex flex-col gap-1">
      <label className={LABEL_CLASS}>
        {label}
        {required && <span className="text-[var(--yuriana-input-error)] ml-0.5">*</span>}
        {optional && <span className="text-[var(--yuriana-input-placeholder)] ml-1 normal-case font-semibold">(opcional)</span>}
      </label>
      <div
        onClick={() => !disabled && !hasExisting && !file && ref.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-xl p-3 text-center transition-all min-h-[70px] ${
          file || hasExisting
            ? "border-[var(--yuriana-base-orange)] bg-orange-50/40"
            : "border-[var(--yuriana-input-border)] bg-[var(--yuriana-input-bg)]"
        } ${!disabled && !hasExisting && !file ? "cursor-pointer hover:border-[var(--yuriana-base-orange)]" : ""} ${disabled ? "opacity-60" : ""}`}
      >
        {file ? (
          <>
            <span className="text-[10px] font-bold text-[var(--yuriana-base-orange)] truncate max-w-full px-4">{file.name}</span>
            {!disabled && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="absolute top-1 right-1 text-rose-400 hover:text-rose-600">
                <X size={10} />
              </button>
            )}
          </>
        ) : hasExisting ? (
          <div className="flex flex-col items-center gap-1.5">
            <a href={existingUrl} target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-bold text-[var(--yuriana-base-orange)] underline">
              Ver archivo
            </a>
            {!disabled && (
              <button type="button" onClick={() => ref.current?.click()}
                className="flex items-center gap-1 text-[9px] font-bold text-[var(--yuriana-input-placeholder)] hover:text-[var(--yuriana-base-orange)] transition-colors">
                <Upload size={9} /> Cambiar
              </button>
            )}
          </div>
        ) : (
          <>
            <Upload size={16} className="text-[var(--yuriana-input-placeholder)]" />
            <span className="text-[9px] text-[var(--yuriana-input-placeholder)]">Upload PDF or Photo</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*,.pdf" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > 10 * 1024 * 1024) {
            toast.error(`"${f.name}" supera el límite de 10 MB`);
            e.target.value = "";
            return;
          }
          onChange(f);
        }} disabled={disabled} />
    </div>
  );
};

interface Props {
  initialData?: ServicioItem | null;
  isReadOnly?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ServicioForm = ({ initialData, isReadOnly = false, onCancel, onSuccess }: Props) => {
  const isEdit = !!initialData;

  // ── Categorías / tipos de viaje ──────────────────────────────────────────
  const [categorias, setCategorias] = useState<{ id_categoria: number; tipo_categoria: string }[]>([]);
  const [idCategoriaSeleccionada, setIdCategoriaSeleccionada] = useState<number | null>(null);
  const esInternacional = categorias.find(c => c.id_categoria === idCategoriaSeleccionada)
    ?.tipo_categoria?.includes("INTERNACIONAL") ?? false;

  // ── Campos del viaje ────────────────────────────────────────────────────
  const [operador, setOperador] = useState<Operador>(Operador.YURIANA);
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [crt, setCrt] = useState("");

  // ── Factura ─────────────────────────────────────────────────────────────
  const [esFacturado, setEsFacturado] = useState<"si" | "no">("no");
  const [facturaTransporte, setFacturaTransporte] = useState("");
  const [montoFactura, setMontoFactura] = useState<number>(0);
  const [archivosFactura, setArchivosFactura] = useState<File[]>([]);

  // ── Documentación aduanera ───────────────────────────────────────────────
  const [requisitosAduaneros, setRequisitosAduaneros] = useState<{ id_requisito_documento: number; nombre_documento: string }[]>([]);
  const [archivosAduaneros, setArchivosAduaneros] = useState<Record<number, File | null>>({});

  // ── Cliente ──────────────────────────────────────────────────────────────
  const [ciCliente, setCiCliente] = useState("");
  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [nitCliente, setNitCliente] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");

  // ── Conductor / Asignación ───────────────────────────────────────────────
  const [ciConductor, setCiConductor] = useState("");
  const [idAsignacion, setIdAsignacion] = useState<number | null>(null);
  const [nombreConductor, setNombreConductor] = useState("");
  const [placaTracto, setPlacaTracto] = useState("");
  const [tipoUnidad, setTipoUnidad] = useState("");

  // ── Colaborador ──────────────────────────────────────────────────────────
  const [ciColaborador, setCiColaborador] = useState("");
  const [idColaborador, setIdColaborador] = useState<number | null>(null);
  const [nombreColaborador, setNombreColaborador] = useState("");
  const [agenciaColaborador, setAgenciaColaborador] = useState("");
  const [montoColaborador, setMontoColaborador] = useState<number>(0);

  // ── Financiero ───────────────────────────────────────────────────────────
  const [moneda, setMoneda] = useState<Moneda>(Moneda.DOLAR);
  const [tipoCambio, setTipoCambio] = useState<number>(0);
  const [flete, setFlete] = useState<number>(0);
  const [fleteAdicional, setFleteAdicional] = useState<number>(0);
  const totalFlete = (flete + fleteAdicional) * (moneda === Moneda.BOLIVIANOS ? 1 : (tipoCambio || 1));

  // ── Fechas ───────────────────────────────────────────────────────────────
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [periodoLiquidacion, setPeriodoLiquidacion] = useState<number>(0);
  const tieneFechaFin = !!fechaFin;

  // ── Carga ────────────────────────────────────────────────────────────────
  const [descripcionCarga, setDescripcionCarga] = useState("");
  const [voucher, setVoucher] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const facturaInputRef = useRef<HTMLInputElement>(null);

  // ── Cargar categorías y requisitos ───────────────────────────────────────
  useEffect(() => {
    getCategorias().then((cats) => {
      const viajeCats = cats.filter((c) =>
        ['VIAJE_INTERNACIONAL', 'VIAJE_NACIONAL'].includes(c.tipo_categoria)
      );
      setCategorias(viajeCats);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!esInternacional) { setRequisitosAduaneros([]); return; }
    if (!idCategoriaSeleccionada) return;
    getRequisitos({ id_categoria: idCategoriaSeleccionada }).then(setRequisitosAduaneros).catch(() => {});
  }, [esInternacional, idCategoriaSeleccionada]);

  // ── Prefill en modo edición/ver ──────────────────────────────────────────
  useEffect(() => {
    if (!initialData) return;
    setIdCategoriaSeleccionada(initialData.id_categoria);
    setOperador(initialData.operador);
    setOrigen(initialData.origen);
    setDestino(initialData.destino);
    setCrt(initialData.crt ?? "");
    // Prefill factura si existe
    if (initialData.factura) {
      setEsFacturado("si");
      setFacturaTransporte(initialData.factura.factura_transporte ?? "");
      setMontoFactura(Number(initialData.factura.monto_factura ?? 0));
    } else {
      setEsFacturado("no");
    }
    setMoneda(initialData.moneda);
    setTipoCambio(Number(initialData.tipo_cambio ?? 0));
    setFlete(Number(initialData.flete));
    setFleteAdicional(Number(initialData.flete_adicional ?? 0));
    setFechaInicio(initialData.fecha_inicio?.slice(0, 10) ?? "");
    setFechaFin(initialData.fecha_fin?.slice(0, 10) ?? "");
    setPeriodoLiquidacion(initialData.periodo_liquidacion ?? 0);
    setDescripcionCarga(initialData.descripcion_carga ?? "");

    // Cliente
    setIdCliente(initialData.id_cliente);
    setNombreCliente(initialData.cliente?.persona?.nombre ?? "");
    setNitCliente(initialData.cliente?.nit ?? "");
    setRazonSocial(initialData.cliente?.razon_social ?? "");

    // Conductor/Asignación
    setIdAsignacion(initialData.id_asignacion);
    setCiConductor(String(initialData.asignacion?.conductor?.persona?.ci ?? ""));
    setNombreConductor(initialData.asignacion?.conductor?.persona?.nombre ?? "");
    setPlacaTracto(initialData.asignacion?.tracto?.placa ?? "");
    setTipoUnidad(initialData.asignacion?.tracto?.categoria?.tipo_categoria ?? "");

    // Colaborador
    if (initialData.colaborador) {
      setIdColaborador(initialData.id_colaborador ?? null);
      setNombreColaborador(initialData.colaborador?.persona?.nombre ?? "");
      setAgenciaColaborador(initialData.colaborador?.agencia ?? "");
      setMontoColaborador(Number((initialData.colaborador as any)?.monto ?? 0));
    }
  }, [initialData]);

  // ── Buscar cliente por CI ────────────────────────────────────────────────
  const buscarCliente = async () => {
    if (!ciCliente.trim()) return toast.error("Ingresa el CI del cliente");
    try {
      const data = await apiFetch(`/cliente/${ciCliente.trim()}`);
      setIdCliente(data.id_cliente);
      setNitCliente(data.nit ?? "");
      setRazonSocial(data.razon_social ?? "");
      setNombreCliente(data.persona?.nombre ?? "");
      toast.success("Cliente encontrado");
    } catch {
      toast.error("Cliente no encontrado");
      setIdCliente(null); setNitCliente(""); setRazonSocial(""); setNombreCliente("");
    }
  };

  // ── Buscar asignación por CI conductor ───────────────────────────────────
  const buscarAsignacion = async () => {
    if (!ciConductor.trim()) return toast.error("Ingresa el CI del conductor");
    try {
      const lista = await getAsignaciones({ ci_conductor: ciConductor.trim() });
      if (!lista.length) throw new Error("Sin asignación activa");
      const asig = lista[0];
      setIdAsignacion(asig.id_asignacion);
      setNombreConductor(asig.conductor?.persona?.nombre ?? "");
      setPlacaTracto(asig.tracto?.placa ?? "");
      setTipoUnidad((asig.tracto as any)?.categoria?.tipo_categoria ?? "");
      toast.success("Asignación encontrada");
    } catch {
      toast.error("No se encontró asignación activa para ese CI");
      setIdAsignacion(null); setNombreConductor(""); setPlacaTracto(""); setTipoUnidad("");
    }
  };

  // ── Buscar colaborador por CI ────────────────────────────────────────────
  const buscarColaborador = async () => {
    if (!ciColaborador.trim()) return;
    try {
      const data = await apiFetch(`/colaborador/${ciColaborador.trim()}`);
      setIdColaborador(data.id_colaborador);
      setNombreColaborador(data.persona?.nombre ?? "");
      setAgenciaColaborador(data.agencia ?? "");
      setMontoColaborador(Number(data.monto ?? 0));
      toast.success("Colaborador encontrado");
    } catch {
      toast.error("Colaborador no encontrado");
      setIdColaborador(null); setNombreColaborador(""); setAgenciaColaborador("");
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!idCategoriaSeleccionada) return toast.error("Selecciona el tipo de viaje");
    if (!origen.trim() || !destino.trim()) return toast.error("Origen y destino son obligatorios");
    if (esInternacional && !crt.trim()) return toast.error("El CRT es obligatorio para viajes internacionales");
    if (!idCliente) return toast.error("Busca y selecciona un cliente");
    if (!idAsignacion) return toast.error("Busca y selecciona un conductor/unidad");
    if (!fechaInicio) return toast.error("La fecha de inicio es obligatoria");
    if (flete <= 0) return toast.error("El flete debe ser mayor a 0");
    if (fleteAdicional < 0) return toast.error("El flete adicional no puede ser negativo");
    if (moneda === Moneda.DOLAR && tipoCambio <= 0) return toast.error("El tipo de cambio debe ser mayor a 0");
    if (montoFactura < 0) return toast.error("El monto de factura no puede ser negativo");
    if (montoColaborador < 0) return toast.error("El monto del colaborador no puede ser negativo");

    // Validación de documentos aduaneros (solo viaje Internacional)
    if (esInternacional && requisitosAduaneros.length > 0) {
      const faltantes = requisitosAduaneros.filter((req) => {
        const tieneNuevo = !!archivosAduaneros[req.id_requisito_documento];
        const tieneExistente = !!initialData?.documentos?.find(
          (d) => d.requisito_documento?.nombre_documento === req.nombre_documento
        );
        return !tieneNuevo && !tieneExistente;
      });
      if (faltantes.length > 0) {
        return toast.error(
          `Documentos aduaneros obligatorios: ${faltantes.map((r) => r.nombre_documento).join(", ")}`
        );
      }
    }

    // Validaciones al finalizar el viaje
    if (fechaFin) {
      if (!periodoLiquidacion || periodoLiquidacion <= 0)
        return toast.error("El período de liquidación es obligatorio al finalizar el viaje");
      if (!voucher && !initialData?.comprobante_pago)
        return toast.error("El comprobante de pago es obligatorio al finalizar el viaje");
      const tieneFacturasExistentes = (initialData?.factura?.fotos?.length ?? 0) > 0;
      if (esFacturado !== "si" || (archivosFactura.length === 0 && !tieneFacturasExistentes))
        return toast.error("La factura es obligatoria al finalizar el viaje");
    }

    const fd = new FormData();
    fd.append("id_categoria",   String(idCategoriaSeleccionada));
    fd.append("operador",       operador);
    fd.append("origen",         origen.trim().toUpperCase());
    fd.append("destino",        destino.trim().toUpperCase());
    if (crt) fd.append("crt",  crt.trim().toUpperCase());
    fd.append("es_facturado",   esFacturado);
    if (esFacturado === "si") {
      if (facturaTransporte) fd.append("factura_transporte", facturaTransporte);
      if (montoFactura > 0)  fd.append("monto_factura", String(montoFactura));
      archivosFactura.forEach(f => fd.append("foto_factura", f));
    }
    fd.append("id_cliente",     String(idCliente));
    fd.append("id_asignacion",  String(idAsignacion));
    if (idColaborador) {
      fd.append("id_colaborador", String(idColaborador));
    }
    fd.append("moneda",         moneda);
    if (moneda === Moneda.DOLAR && tipoCambio > 0) fd.append("tipo_cambio", String(tipoCambio));
    fd.append("flete",          String(flete));
    if (fleteAdicional > 0) fd.append("flete_adicional", String(fleteAdicional));
    fd.append("fecha_inicio",   fechaInicio);
    if (fechaFin) fd.append("fecha_fin", fechaFin);
    if (periodoLiquidacion > 0) fd.append("periodo_liquidacion", String(periodoLiquidacion));
    if (descripcionCarga) fd.append("descripcion_carga", descripcionCarga.trim());
    if (voucher) fd.append("vaucher", voucher);

    // Documentación aduanera
    const idsRequisitos: number[] = [];
    requisitosAduaneros.forEach((req) => {
      const archivo = archivosAduaneros[req.id_requisito_documento];
      if (archivo) {
        fd.append("documentacion_aduanera", archivo);
        idsRequisitos.push(req.id_requisito_documento);
      }
    });
    if (idsRequisitos.length > 0) {
      fd.append("ids_requisitos_aduaneros", idsRequisitos.join(","));
    }

    try {
      setSaving(true);
      if (isEdit && initialData) {
        await editarServicio(initialData.id_servicio, fd);
        toast.success("Viaje actualizado correctamente.");
      } else {
        await crearServicio(fd);
        toast.success("Viaje registrado correctamente.");
      }
      onSuccess();
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header card */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8">
        <div className="flex items-center gap-3">
          <Info size={20} className="text-[var(--yuriana-section-icon)]" />
          <h2 className="text-xl font-black text-[var(--yuriana-base-gray-dark)] uppercase tracking-tight">
            {isEdit ? "Editar Viaje" : "Datos del Viaje"}
          </h2>
        </div>
      </div>

      {/* Sección: Datos del Viaje */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<MapPin size={16} />} title="Datos del Viaje" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="ID Viaje">
            <input className={INPUT_CLASS} disabled value={initialData?.codigo_servicio ?? "Auto generado"} readOnly />
          </Field>
          <Field label="Operador" required>
            <select className={INPUT_CLASS} value={operador} onChange={(e) => setOperador(e.target.value as Operador)} disabled={isReadOnly}>
              <option value={Operador.YURIANA}>Yuriana</option>
              <option value={Operador.OTROS}>Otros</option>
            </select>
          </Field>
          <Field label="Tipo de Viaje" required>
            <div className="flex gap-2">
              {categorias.map((cat) => {
                const esInt = cat.tipo_categoria.includes("INTERNACIONAL");
                const label = esInt ? "Internacional" : "Nacional";
                const seleccionado = idCategoriaSeleccionada === cat.id_categoria;
                return (
                  <button key={cat.id_categoria} type="button"
                    disabled={isReadOnly}
                    onClick={() => setIdCategoriaSeleccionada(cat.id_categoria)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      seleccionado
                        ? "bg-[var(--yuriana-base-orange)] text-white shadow"
                        : "bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)]"
                    }`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="CRT" required={esInternacional} optional={!esInternacional}>
            <input className={INPUT_CLASS} value={crt} onChange={(e) => setCrt(e.target.value)} disabled={isReadOnly} placeholder="N° CRT" />
          </Field>
          <Field label="Origen" required>
            <input className={INPUT_CLASS} value={origen} onChange={(e) => setOrigen(e.target.value)} disabled={isReadOnly} placeholder="Ciudad de origen" />
          </Field>
          <Field label="Destino" required>
            <input className={INPUT_CLASS} value={destino} onChange={(e) => setDestino(e.target.value)} disabled={isReadOnly} placeholder="Ciudad de destino" />
          </Field>
        </div>
      </div>

      {/* Sección: Datos de Factura */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<FileText size={16} />} title="Datos de Factura" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="Facturado" required={tieneFechaFin} optional={!tieneFechaFin}>
            <div className="flex gap-2 h-[34px] items-center">
              {(["si", "no"] as const).map((v) => (
                <button key={v} type="button" disabled={isReadOnly}
                  onClick={() => setEsFacturado(v)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all border ${
                    esFacturado === v
                      ? "bg-[var(--yuriana-base-orange)] text-white border-[var(--yuriana-base-orange)]"
                      : "bg-[var(--yuriana-input-bg)] border-[var(--yuriana-input-border)] text-[var(--yuriana-input-placeholder)]"
                  }`}>
                  {v === "si" ? "✓ Sí" : "No"}
                </button>
              ))}
            </div>
          </Field>
          {esFacturado === "si" && (
            <>
              <Field label="Factura Transporte" optional>
                <input className={INPUT_CLASS} value={facturaTransporte} onChange={(e) => setFacturaTransporte(e.target.value)} disabled={isReadOnly} placeholder="N° de factura" />
              </Field>
              <Field label="Monto Factura Bs" optional>
                <input type="number" className={INPUT_CLASS} value={montoFactura || ""} onChange={(e) => setMontoFactura(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
              </Field>
              {/* Multi-foto factura */}
              <div className="flex flex-col gap-1 col-span-2 md:col-span-2">
                <label className={LABEL_CLASS}>
                  Facturas
                  {tieneFechaFin && <span className="text-[var(--yuriana-input-error)] ml-0.5">*</span>}
                  {!tieneFechaFin && <span className="text-[var(--yuriana-input-placeholder)] ml-1 normal-case font-semibold">(opcional)</span>}
                  <span className="text-[var(--yuriana-input-placeholder)] ml-1 font-semibold normal-case">máx. 10</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Fotos existentes */}
                  {initialData?.factura?.fotos?.map((f) => (
                    <a key={f.id_foto_factura} href={f.url_foto} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-dashed border-[var(--yuriana-base-orange)] bg-orange-50/40 text-[10px] font-bold text-[var(--yuriana-base-orange)] underline min-h-[50px]">
                      Ver archivo
                    </a>
                  ))}
                  {/* Nuevos archivos seleccionados */}
                  {archivosFactura.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-dashed border-[var(--yuriana-base-orange)] bg-orange-50/40 min-h-[50px] relative">
                      <span className="text-[10px] font-bold text-[var(--yuriana-base-orange)] max-w-[80px] truncate">{f.name}</span>
                      {!isReadOnly && (
                        <button type="button" onClick={() => setArchivosFactura(prev => prev.filter((_, j) => j !== i))}
                          className="text-rose-400 hover:text-rose-600 ml-1"><X size={10} /></button>
                      )}
                    </div>
                  ))}
                  {/* Botón agregar */}
                  {!isReadOnly && ((initialData?.factura?.fotos?.length ?? 0) + archivosFactura.length) < 10 && (
                    <button type="button" onClick={() => facturaInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl border-2 border-dashed border-[var(--yuriana-input-border)] hover:border-[var(--yuriana-base-orange)] bg-[var(--yuriana-input-bg)] min-h-[50px] transition-all">
                      <Upload size={14} className="text-[var(--yuriana-input-placeholder)]" />
                      <span className="text-[9px] text-[var(--yuriana-input-placeholder)]">Agregar</span>
                    </button>
                  )}
                </div>
                <input ref={facturaInputRef} type="file" accept="image/*,.pdf" multiple className="hidden"
                  onChange={(e) => {
                    const seleccionados = Array.from(e.target.files ?? []);
                    const validos = seleccionados.filter(f => {
                      if (f.size > 10 * 1024 * 1024) {
                        toast.error(`"${f.name}" supera el límite de 10 MB`);
                        return false;
                      }
                      return true;
                    });
                    const total = (initialData?.factura?.fotos?.length ?? 0) + archivosFactura.length;
                    const disponibles = Math.max(0, 10 - total);
                    setArchivosFactura(prev => [...prev, ...validos.slice(0, disponibles)]);
                    e.target.value = "";
                  }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sección: Documentación Aduanera (solo Internacional) */}
      {esInternacional && (
        <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
          <SectionHeader icon={<Ship size={16} />} title="Documentación Aduanera" />
          {requisitosAduaneros.length === 0 ? (
            <p className="text-xs text-[var(--yuriana-input-placeholder)] italic">Cargando documentos requeridos...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {requisitosAduaneros.map((req) => {
                const docExistente = initialData?.documentos?.find(
                  d => d.requisito_documento?.nombre_documento === req.nombre_documento
                );
                return (
                  <FileUploadSlot key={req.id_requisito_documento}
                    label={req.nombre_documento}
                    file={archivosAduaneros[req.id_requisito_documento] ?? null}
                    onChange={(f) => setArchivosAduaneros(prev => ({ ...prev, [req.id_requisito_documento]: f }))}
                    disabled={isReadOnly}
                    required={!docExistente}
                    existingUrl={docExistente?.url_documento}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sección: Datos del Cliente */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Users size={16} />} title="Datos del Cliente" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="Id Cliente (CI)" required>
            <div className="flex gap-2">
              <input className={INPUT_CLASS} value={ciCliente} onChange={(e) => setCiCliente(e.target.value)}
                disabled={isReadOnly} placeholder="Buscar CI..." onKeyDown={(e) => e.key === "Enter" && buscarCliente()} />
              {!isReadOnly && (
                <button type="button" onClick={buscarCliente}
                  className="px-3 rounded-xl bg-[var(--yuriana-base-yellow)] hover:opacity-90 active:scale-95 transition-all">
                  <Search size={13} />
                </button>
              )}
            </div>
          </Field>
          <Field label="NIT">
            <input className={INPUT_CLASS} value={nitCliente} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Razón Social">
            <input className={INPUT_CLASS} value={razonSocial} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Nombre Cliente">
            <input className={INPUT_CLASS} value={nombreCliente} disabled readOnly placeholder="-" />
          </Field>
        </div>
      </div>

      {/* Sección: Datos del Conductor y la Unidad */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Truck size={16} />} title="Datos del Conductor y la Unidad" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="CI del Conductor" required>
            <div className="flex gap-2">
              <input className={INPUT_CLASS} value={ciConductor} onChange={(e) => setCiConductor(e.target.value)}
                disabled={isReadOnly} placeholder="Buscar CI..." onKeyDown={(e) => e.key === "Enter" && buscarAsignacion()} />
              {!isReadOnly && (
                <button type="button" onClick={buscarAsignacion}
                  className="px-3 rounded-xl bg-[var(--yuriana-base-yellow)] hover:opacity-90 active:scale-95 transition-all">
                  <Search size={13} />
                </button>
              )}
            </div>
          </Field>
          <Field label="Nombre Conductor">
            <input className={INPUT_CLASS} value={nombreConductor} disabled readOnly placeholder="-" />
          </Field>
          <Field label="N° de Placa">
            <input className={INPUT_CLASS} value={placaTracto} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Tipo de Unidad">
            <input className={INPUT_CLASS} value={tipoUnidad} disabled readOnly placeholder="-" />
          </Field>
        </div>
      </div>

      {/* Sección: Datos del Colaborador (opcional) */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<UserCheck size={16} />} title="Datos del Colaborador" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="CI del Colaborador" optional>
            <div className="flex gap-2">
              <input className={INPUT_CLASS} value={ciColaborador} onChange={(e) => setCiColaborador(e.target.value)}
                disabled={isReadOnly} placeholder="Opcional..." onKeyDown={(e) => e.key === "Enter" && buscarColaborador()} />
              {!isReadOnly && (
                <button type="button" onClick={buscarColaborador}
                  className="px-3 rounded-xl bg-[var(--yuriana-base-yellow)] hover:opacity-90 active:scale-95 transition-all">
                  <Search size={13} />
                </button>
              )}
            </div>
          </Field>
          <Field label="Nombre Colaborador">
            <input className={INPUT_CLASS} value={nombreColaborador} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Agencia">
            <input className={INPUT_CLASS} value={agenciaColaborador} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Monto" optional>
            <input type="number" className={INPUT_CLASS} value={montoColaborador || ""} onChange={(e) => setMontoColaborador(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
        </div>
      </div>

      {/* Sección: Tipo de cambio */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<DollarSign size={16} />} title="Tipo de Cambio" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <Field label="Seleccione la Moneda" required>
            <select className={INPUT_CLASS} value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} disabled={isReadOnly}>
              <option value={Moneda.DOLAR}>Dólar</option>
              <option value={Moneda.BOLIVIANOS}>Bolivianos</option>
            </select>
          </Field>
          {moneda === Moneda.DOLAR && (
            <Field label="Tipo de Cambio Bs" required>
              <input type="number" className={INPUT_CLASS} value={tipoCambio || ""} onChange={(e) => setTipoCambio(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
            </Field>
          )}
        </div>
      </div>

      {/* Sección: Datos del Flete */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Truck size={16} />} title="Datos del Flete" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <Field label={`Monto Flete (${moneda === Moneda.DOLAR ? "Dólar" : "Bs"})`} required>
            <input type="number" className={INPUT_CLASS} value={flete || ""} onChange={(e) => setFlete(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
          <Field label={`Flete Adicional (${moneda === Moneda.DOLAR ? "Dólar" : "Bs"})`} optional>
            <input type="number" className={INPUT_CLASS} value={fleteAdicional || ""} onChange={(e) => setFleteAdicional(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
          <Field label="Total Flete Bs">
            <div className="flex items-center">
              <input className={`${INPUT_CLASS} font-black text-[var(--yuriana-base-orange)]`}
                value={new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(totalFlete)} disabled readOnly />
              <span className="ml-2 text-xs font-bold text-[var(--yuriana-input-placeholder)]">Bs</span>
            </div>
          </Field>
        </div>
      </div>

      {/* Sección: Datos de Fechas */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Calendar size={16} />} title="Datos de Fechas" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Fecha Inicio" required>
            <input type="date" className={INPUT_CLASS} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} disabled={isReadOnly} />
          </Field>
          <Field label="Fecha Fin" optional>
            <input type="date" className={INPUT_CLASS} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={isReadOnly} />
          </Field>
          <Field label="Período de Liquidación (días)" required={tieneFechaFin} optional={!tieneFechaFin}>
            <input type="number" className={INPUT_CLASS} value={periodoLiquidacion || ""} onChange={(e) => setPeriodoLiquidacion(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
          <Field label="Fecha Límite Pago">
            <input type="date" className={INPUT_CLASS} disabled readOnly
              value={fechaFin && periodoLiquidacion > 0
                ? new Date(new Date(fechaFin).getTime() + periodoLiquidacion * 86400000).toISOString().slice(0, 10)
                : initialData?.fecha_limite_pago?.slice(0, 10) ?? ""
              } />
          </Field>
        </div>
      </div>

      {/* Sección: Datos de la Carga */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Package size={16} />} title="Datos de la Carga" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="Descripción de la Carga" optional>
            <input className={INPUT_CLASS} value={descripcionCarga} onChange={(e) => setDescripcionCarga(e.target.value)} disabled={isReadOnly} placeholder="Tipo de carga..." />
          </Field>
          <FileUploadSlot label="Voucher / Comprobante"
            file={voucher} onChange={setVoucher} disabled={isReadOnly}
            required={tieneFechaFin} optional={!tieneFechaFin}
            existingUrl={initialData?.comprobante_pago} />
          <Field label="Estado de Pago">
            <input className={`${INPUT_CLASS} capitalize`} disabled readOnly
              value={initialData?.estado_pago ?? "pendiente"} />
          </Field>
          <Field label="Estado de Viaje">
            <input className={`${INPUT_CLASS} capitalize`} disabled readOnly
              value={initialData?.estado_servicio ?? "en curso"} />
          </Field>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-2">
        <button type="button" onClick={onCancel}
          className="px-8 py-3 rounded-2xl font-bold text-sm bg-[var(--yuriana-btn-cancel-bg)] text-[var(--yuriana-btn-cancel-text)] hover:opacity-90 transition-all active:scale-95">
          Cancelar
        </button>
        {!isReadOnly && (
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="px-8 py-3 rounded-2xl font-black text-sm bg-[var(--yuriana-btn-save-bg)] text-[var(--yuriana-btn-save-text)] hover:opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-50">
            {saving ? "Guardando..." : isEdit ? "Actualizar Viaje" : "Guardar Viaje"}
          </button>
        )}
      </div>
    </div>
  );
};
