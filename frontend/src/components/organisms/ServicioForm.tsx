"use client";
import { useState, useEffect, useRef } from "react";
import { Info, MapPin, FileText, Ship, Users, Truck, UserCheck, DollarSign, Calendar, Package, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ServicioItem, Moneda, Operador, Embarque } from "@/types/servicio.types";
import { crearServicio, editarServicio } from "@/lib/api/servicio.api";
import { getCategorias } from "@/lib/api/requisito.api";
import { getAsignaciones } from "@/lib/api/asignacion.api";
import { getRequisitos } from "@/lib/api/requisito.api";
import { getClientes } from "@/lib/api/cliente.api";
import { getColaboradores } from "@/lib/api/colaborador.api";
import { apiFetch } from "@/lib/api";
import { getEmbarquesDisponibles, crearEmbarque } from "@/lib/api/embarque.api";
import { SearchableCombobox } from "@/components/molecules/SearchableCombobox";
import { FormActions } from "@/components/atoms/FormActions";
import { TableActions } from "@/components/atoms/TableActions";
import { toDateInputBolivia } from "@/lib/date-bolivia";
import type { Cliente } from "@/types/cliente.types";
import type { Colaborador } from "@/types/colaborador.types";
import type { Asignacion } from "@/types/asignacion.types";

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
  onSuccess: (item: ServicioItem) => void;
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
  const [idEmbarque, setIdEmbarque] = useState<number | null>(null);
  const [embarqueSeleccionado, setEmbarqueSeleccionado] = useState<Embarque | null>(null);
  const [embarquesDisponibles, setEmbarquesDisponibles] = useState<Embarque[]>([]);
  const [mostrarNuevoEmbarque, setMostrarNuevoEmbarque] = useState(false);
  const [nuevoCrt, setNuevoCrt] = useState("");
  const [nuevasUnidades, setNuevasUnidades] = useState(1);
  const [guardandoEmbarque, setGuardandoEmbarque] = useState(false);

  // ── Facturas del servicio ───────────────────────────────────────────────
  type FacturaPendiente = { factura_transporte: string; monto_factura: number; transmitido: boolean; archivos: File[] };
  const [facturaModalAbierto, setFacturaModalAbierto] = useState(false);
  const [facturaTransporte, setFacturaTransporte] = useState("");
  const [montoFactura, setMontoFactura] = useState<number>(0);
  const [transmitirFactura, setTransmitirFactura] = useState(true);
  const [archivosFactura, setArchivosFactura] = useState<File[]>([]);
  const [previewsFactura, setPreviewsFactura] = useState<string[]>([]);
  const [fotosFacturaExistentes, setFotosFacturaExistentes] = useState<{ id_foto_factura: number; url_foto: string }[]>([]);
  const [fotosFacturaEliminadas, setFotosFacturaEliminadas] = useState<number[]>([]);
  const [facturaEnEdicion, setFacturaEnEdicion] = useState<number | null>(null);
  const [facturaExistenteEnEdicion, setFacturaExistenteEnEdicion] = useState<number | null>(null);
  const [facturasExistentesEditadas, setFacturasExistentesEditadas] = useState<Record<number, { factura_transporte: string; monto_factura: number; transmitido: boolean; archivos: File[]; fotos_eliminar: number[] }>>({});
  const [facturasExistentesEliminadas, setFacturasExistentesEliminadas] = useState<number[]>([]);
  const [fotoFacturaAmpliada, setFotoFacturaAmpliada] = useState<string | null>(null);
  const [facturasPendientes, setFacturasPendientes] = useState<FacturaPendiente[]>([]);

  // ── Documentación aduanera ───────────────────────────────────────────────
  const [requisitosAduaneros, setRequisitosAduaneros] = useState<{ id_requisito_documento: number; nombre_documento: string }[]>([]);
  const [archivosAduaneros, setArchivosAduaneros] = useState<Record<number, File | null>>({});

  // ── Cliente ──────────────────────────────────────────────────────────────
  const [ciCliente, setCiCliente] = useState("");
  const [codigoCliente, setCodigoCliente] = useState("");
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
  const [operacionFleteAdicional, setOperacionFleteAdicional] = useState<'SUMA' | 'RESTA'>('SUMA');
  const fleteAdicionalCalculado = operacionFleteAdicional === 'SUMA' ? fleteAdicional : -fleteAdicional;
  const totalFlete = (flete + fleteAdicionalCalculado) * (moneda === Moneda.BOLIVIANOS ? 1 : (tipoCambio || 1));

  // ── Fechas ───────────────────────────────────────────────────────────────
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [periodoLiquidacion, setPeriodoLiquidacion] = useState<number>(0);
  const tieneFechaFin = !!fechaFin;

  // ── Carga ────────────────────────────────────────────────────────────────
  const [descripcionCarga, setDescripcionCarga] = useState("");
  const [voucher, setVoucher] = useState<File | null>(null);
  const [fechaPago, setFechaPago] = useState("");

  const [saving, setSaving] = useState(false);
  const facturaInputRef = useRef<HTMLInputElement>(null);

  const limpiarBorradorFactura = () => {
    previewsFactura.forEach((preview) => URL.revokeObjectURL(preview));
    setFacturaTransporte("");
    setMontoFactura(0);
    setTransmitirFactura(true);
    setArchivosFactura([]);
    setPreviewsFactura([]);
    setFotosFacturaExistentes([]);
    setFotosFacturaEliminadas([]);
    setFacturaEnEdicion(null);
    setFacturaExistenteEnEdicion(null);
  };

  const abrirFacturaPendiente = (index: number) => {
    const factura = facturasPendientes[index];
    limpiarBorradorFactura();
    setFacturaTransporte(factura.factura_transporte);
    setMontoFactura(factura.monto_factura);
    setTransmitirFactura(factura.transmitido);
    setArchivosFactura(factura.archivos);
    setPreviewsFactura(factura.archivos.map((archivo) => URL.createObjectURL(archivo)));
    setFacturaEnEdicion(index);
    setFacturaModalAbierto(true);
  };

  const abrirFacturaExistente = (factura: NonNullable<ServicioItem["facturas"]>[number]) => {
    limpiarBorradorFactura();
    const editada = facturasExistentesEditadas[factura.id_factura];
    setFacturaTransporte(editada?.factura_transporte ?? factura.factura_transporte ?? "");
    setMontoFactura(editada?.monto_factura ?? Number(factura.monto_factura ?? 0));
    setTransmitirFactura(editada?.transmitido ?? factura.transmitido !== false);
    setFotosFacturaExistentes(factura.fotos ?? []);
    const archivosEditados = editada?.archivos ?? [];
    setArchivosFactura(archivosEditados);
    setPreviewsFactura(archivosEditados.map((archivo) => URL.createObjectURL(archivo)));
    setFacturaExistenteEnEdicion(factura.id_factura);
    setFacturaModalAbierto(true);
  };

  // ── Listas para comboboxes ───────────────────────────────────────────────
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [listaAsignaciones, setListaAsignaciones] = useState<Asignacion[]>([]);
  const [listaColaboradores, setListaColaboradores] = useState<Colaborador[]>([]);
  const [loadingListas, setLoadingListas] = useState(false);

  // ── Cargar listas para comboboxes al montar ──────────────────────────────
  useEffect(() => {
    if (isReadOnly) return;
    setLoadingListas(true);
    
    Promise.all([
      getClientes(), 
      getAsignaciones({ estado_asignacion: 'ACTIVA' }),
      getColaboradores()
    ])
      .then(async ([clientes, asignacionesActivas, colaboradores]) => {
        setListaClientes(clientes);
        setListaColaboradores(colaboradores);

        // Lógica robusta para asegurar que la asignación actual (en modo edición) esté en la lista.
        if (initialData?.id_asignacion && !asignacionesActivas.some(a => a.id_asignacion === initialData.id_asignacion)) {
          try {
            // No podemos filtrar por 'id_asignacion' directamente.
            // Usamos el CI del conductor, que es un filtro soportado, para encontrar la asignación.
            const ciConductorActual = initialData.asignacion?.conductor?.persona?.ci;
            if (ciConductorActual) {
              const asignacionesDelConductor = await getAsignaciones({ ci_conductor: String(ciConductorActual) });
              const asignacionActual = asignacionesDelConductor.find(a => a.id_asignacion === initialData.id_asignacion);
              if (asignacionActual) {
                setListaAsignaciones([asignacionActual, ...asignacionesActivas]);
                return; // Salimos para no ejecutar el setListaAsignaciones de abajo
              }
            }
          } catch {
            toast.error("Error al cargar la asignación actual del viaje.");
          }
        }

        setListaAsignaciones(asignacionesActivas);

        // Si no se hizo nada especial, o si algo falló, simplemente usamos la lista de activas.
        setListaAsignaciones(asignacionesActivas);
      })
      .catch(() => toast.error("Error al cargar listas", { description: "No se pudieron obtener los datos para los menús desplegables." }))
      .finally(() => setLoadingListas(false));
  }, [isReadOnly, initialData]);

  useEffect(() => {
    if (isReadOnly) return;
    getEmbarquesDisponibles().then(setEmbarquesDisponibles).catch(() => toast.error("No se pudieron cargar los CRT disponibles"));
  }, [isReadOnly]);

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
    setIdEmbarque(initialData.id_embarque ?? initialData.embarque?.id_embarque ?? null);
    setEmbarqueSeleccionado(initialData.embarque ?? null);
    setFacturasPendientes([]);
    setFacturasExistentesEditadas({});
    setFacturasExistentesEliminadas([]);
    setMoneda(initialData.moneda);
    setTipoCambio(Number(initialData.tipo_cambio ?? 0));
    setFlete(Number(initialData.flete));
    setFleteAdicional(Number(initialData.flete_adicional ?? 0));
    setOperacionFleteAdicional((initialData as any).operacion_flete_adicional || 'SUMA');
    setFechaInicio(initialData.fecha_inicio?.slice(0, 10) ?? "");
    setFechaFin(initialData.fecha_fin?.slice(0, 10) ?? "");
    setPeriodoLiquidacion(initialData.periodo_liquidacion ?? 0);
    setDescripcionCarga(initialData.descripcion_carga ?? "");
    setFechaPago(initialData.fecha_pago?.slice(0, 10) ?? "");

    // Cliente
    setIdCliente(initialData.id_cliente);
    setCiCliente(String(initialData.cliente?.persona?.ci ?? ""));
    setCodigoCliente((initialData.cliente as any)?.codigo_cliente ?? "");
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
      setCiColaborador(String((initialData.colaborador?.persona as any)?.ci ?? ""));
      setNombreColaborador(initialData.colaborador?.persona?.nombre ?? "");
      setAgenciaColaborador(initialData.colaborador?.agencia ?? "");
      setMontoColaborador(Number((initialData.colaborador as any)?.monto ?? 0));
    }
  }, [initialData]);

  const seleccionarEmbarque = (embarque: Embarque) => {
    setIdEmbarque(embarque.id_embarque);
    setCrt(embarque.crt);
    setEmbarqueSeleccionado(embarque);
  };

  const guardarNuevoEmbarque = async () => {
    if (!nuevoCrt.trim() || nuevasUnidades < 1) {
      toast.error("Ingresa el CRT y un número de viajes válido");
      return;
    }
    try {
      setGuardandoEmbarque(true);
      const nuevo = await crearEmbarque({ crt: nuevoCrt.trim().toUpperCase(), total_unidades: nuevasUnidades });
      seleccionarEmbarque(nuevo);
      setEmbarquesDisponibles((prev) => [nuevo, ...prev]);
      setNuevoCrt("");
      setNuevasUnidades(1);
      setMostrarNuevoEmbarque(false);
      toast.success("Embarque creado");
    } catch (error: any) {
      toast.error("No se pudo crear el embarque", { description: error.message });
    } finally {
      setGuardandoEmbarque(false);
    }
  };

  // ── Buscar cliente por CI ────────────────────────────────────────────────
  const buscarCliente = async () => {
    if (!ciCliente.trim()) return toast.error("Ingresa el CI del cliente");
    try {
      const data = await apiFetch(`/cliente/${ciCliente.trim()}`);
      setIdCliente(data.id_cliente);
      setCodigoCliente(data.codigo_cliente ?? "");
      setNitCliente(data.nit ?? "");
      setRazonSocial(data.razon_social ?? "");
      setNombreCliente(data.persona?.nombre ?? "");
      toast.success("Cliente encontrado");
    } catch {
      toast.error("Cliente no encontrado");
      setIdCliente(null); setCodigoCliente(""); setNitCliente(""); setRazonSocial(""); setNombreCliente("");
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
    if (!ciColaborador.trim()) return toast.error("Ingresa el CI del colaborador");
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
    if (esInternacional && !idEmbarque) return toast.error("El embarque y CRT son obligatorios para viajes internacionales");
    if (!idCliente) return toast.error("Busca y selecciona un cliente");
    if (!idAsignacion) return toast.error("Busca y selecciona un conductor/unidad");
    if (!fechaInicio) return toast.error("La fecha de inicio es obligatoria");
    if (flete <= 0) return toast.error("El flete debe ser mayor a 0");
    if (fleteAdicional < 0) return toast.error("El flete adicional no puede ser negativo");
    if (moneda === Moneda.DOLAR && tipoCambio <= 0) return toast.error("El tipo de cambio debe ser mayor a 0");
    if (montoFactura < 0) return toast.error("El monto de factura no puede ser negativo");
    if (montoColaborador < 0) return toast.error("El monto del colaborador no puede ser negativo");

    // Validación de límites numéricos para evitar desbordamiento en la base de datos
    const LIMITE_MONTO = 10_000_000_000; // Límite para 10 dígitos enteros (precisión 12, escala 2)
    if (flete >= LIMITE_MONTO) {
      return toast.error("Monto de Flete Excedido", { description: `El valor no puede ser mayor o igual a 10 mil millones.` });
    }
    if (fleteAdicional >= LIMITE_MONTO) {
      return toast.error("Flete Adicional Excedido", { description: `El valor no puede ser mayor o igual a 10 mil millones.` });
    }
    if (montoFactura >= LIMITE_MONTO) {
      return toast.error("Monto de Factura Excedido", { description: `El valor no puede ser mayor o igual a 10 mil millones.` });
    }

    // VALIDACIÓN CRUZADA VOUCHER Y FECHA PAGO
    const tieneVoucher = !!voucher || !!initialData?.comprobante_pago;
    if (fechaPago && !tieneVoucher) {
      return toast.error("Si registra una fecha de pago, debe subir el comprobante (voucher).");
    }
    // Si se sube un voucher nuevo, o si ya existía uno y no se ha puesto fecha de pago
    if (tieneVoucher && !fechaPago) {
      return toast.error("Si sube un comprobante (voucher), debe registrar la fecha de pago.");
    }

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

    if (fechaFin) {
      if (!periodoLiquidacion || periodoLiquidacion <= 0)
        return toast.error("El período de liquidación es obligatorio al finalizar el viaje");
    }

    const fd = new FormData();
    fd.append("id_categoria",   String(idCategoriaSeleccionada));
    fd.append("operador",       operador);
    fd.append("origen",         origen.trim().toUpperCase());
    fd.append("destino",        destino.trim().toUpperCase());
    fd.append("id_embarque", idEmbarque ? String(idEmbarque) : "");
    if (facturasPendientes.length > 0) {
      let indiceFoto = 0;
      fd.append("facturas", JSON.stringify(facturasPendientes.map((factura) => ({
        factura_transporte: factura.factura_transporte,
        monto_factura: factura.monto_factura,
        transmitido: factura.transmitido,
        foto_indices: factura.archivos.map(() => indiceFoto++),
      }))));
      facturasPendientes.forEach((factura) => factura.archivos.forEach((archivo) => fd.append("facturas_fotos", archivo)));
    }
    if (fotosFacturaEliminadas.length > 0) fd.append("ids_fotos_eliminar", fotosFacturaEliminadas.join(","));
    if (Object.keys(facturasExistentesEditadas).length > 0) {
      let indiceFoto = facturasPendientes.reduce((total, factura) => total + factura.archivos.length, 0);
      fd.append("facturas_actualizar", JSON.stringify(Object.entries(facturasExistentesEditadas).map(([id_factura, factura]) => ({
        id_factura: Number(id_factura),
        factura_transporte: factura.factura_transporte,
        monto_factura: factura.monto_factura,
        transmitido: factura.transmitido,
        foto_indices: factura.archivos.map(() => indiceFoto++),
        fotos_eliminar: factura.fotos_eliminar,
      }))));
      Object.values(facturasExistentesEditadas).forEach((factura) => factura.archivos.forEach((archivo) => fd.append("facturas_fotos", archivo)));
    }
    if (facturasExistentesEliminadas.length > 0) fd.append("facturas_eliminar", facturasExistentesEliminadas.join(","));
    fd.append("id_cliente",     String(idCliente));
    fd.append("id_asignacion",  String(idAsignacion));
    if (idColaborador) fd.append("id_colaborador", String(idColaborador));
    fd.append("moneda",         moneda);
    if (moneda === Moneda.DOLAR && tipoCambio > 0) fd.append("tipo_cambio", String(tipoCambio));
    fd.append("flete",          String(flete));
    if (fleteAdicional >= 0) {
      fd.append("flete_adicional", String(fleteAdicional));
      fd.append("operacion_flete_adicional", operacionFleteAdicional);
    }
    fd.append("fecha_inicio",   fechaInicio);
    if (fechaFin) {
      fd.append("fecha_fin", fechaFin);
    } else if (isEdit && initialData?.fecha_fin) {
      // El usuario borró una fecha_fin ya guardada: pide revertir el viaje a EN_CURSO
      fd.append("borrar_fecha_fin", "true");
    }
    if (periodoLiquidacion > 0) fd.append("periodo_liquidacion", String(periodoLiquidacion));
    if (descripcionCarga) fd.append("descripcion_carga", descripcionCarga.trim());
    if (fechaPago) fd.append("fecha_pago", fechaPago);
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
        const updatedItem = await editarServicio(initialData.id_servicio, fd);
        toast.success("Viaje actualizado correctamente.");
        onSuccess(updatedItem);
      } else {
        const newItem = await crearServicio(fd);
        toast.success("Viaje registrado correctamente.");
        onSuccess(newItem);
      }
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
          <Field label="CODIGO DEL Viaje">
            <input className={INPUT_CLASS} disabled value={initialData?.codigo_servicio ?? "Auto generado"} readOnly />
          </Field>
          <Field label="Operador" required>
            <select className={INPUT_CLASS} value={operador} onChange={(e) => setOperador(e.target.value as Operador)} disabled={isReadOnly}>
              <option value={Operador.YURIANA}>YURIANA</option>
              <option value={Operador.OTROS}>OTROS</option>
            </select>
          </Field>
          <Field label="Tipo de Viaje" required>
            <div className="flex gap-2">
              {(isReadOnly ? categorias.filter((cat) => cat.id_categoria === idCategoriaSeleccionada) : categorias).map((cat) => {
                const esInt = cat.tipo_categoria.includes("INTERNACIONAL");
                const label = esInt ? "Internacional" : "Nacional";
                const seleccionado = idCategoriaSeleccionada === cat.id_categoria;
                return (
                  <button key={cat.id_categoria} type="button"
                    disabled={isReadOnly}
                    onClick={() => setIdCategoriaSeleccionada(cat.id_categoria)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      seleccionado
                        ? "bg-[var(--yuriana-base-yellow)] text-white shadow"
                        : "bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] text-[var(--yuriana-input-placeholder)] hover:border-[var(--yuriana-base-orange)]"
                    }`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Origen" required>
            <input className={INPUT_CLASS} value={origen} onChange={(e) => setOrigen(e.target.value)} disabled={isReadOnly} placeholder="Ciudad de origen" />
          </Field>
          <Field label="Destino" required>
            <input className={INPUT_CLASS} value={destino} onChange={(e) => setDestino(e.target.value)} disabled={isReadOnly} placeholder="Ciudad de destino" />
          </Field>
        </div>
      </div>

      {/* Sección: Embarque */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Ship size={16} />} title="Embarque" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Field label="CRT" required={esInternacional} optional={!esInternacional}>
            <SearchableCombobox
              options={[
                ...embarquesDisponibles.filter((embarque) => embarque.id_embarque !== idEmbarque),
                ...(embarqueSeleccionado ? [embarqueSeleccionado] : []),
              ].map((embarque) => ({
                value: embarque.id_embarque,
                label: embarque.crt,
                sublabel: `Viajes restantes: ${embarque.unidades_restantes} de ${embarque.total_unidades}`,
              }))}
              value={crt}
              selectedOptionValue={idEmbarque ?? undefined}
              placeholder="Buscar o seleccionar CRT..."
              disabled={isReadOnly}
              onSelect={(option) => {
                const embarque = [...embarquesDisponibles, ...(embarqueSeleccionado ? [embarqueSeleccionado] : [])]
                  .find((item) => item.id_embarque === option.value);
                if (embarque) seleccionarEmbarque(embarque);
              }}
            />
          </Field>
          <Field label="Viajes restantes">
            <input className={`${INPUT_CLASS} font-black text-[var(--yuriana-base-orange)]`} value={embarqueSeleccionado ? `${embarqueSeleccionado.unidades_restantes} de ${embarqueSeleccionado.total_unidades}` : "-"} disabled readOnly />
          </Field>
          <div className="flex gap-2">
            {!isReadOnly && (
              <button type="button" onClick={() => setMostrarNuevoEmbarque(true)} className="flex-1 rounded-xl bg-[var(--yuriana-base-orange)] px-4 py-2 text-xs font-black uppercase text-white">
                + Nuevo CRT
              </button>
            )}
            {!isReadOnly && idEmbarque && !esInternacional && (
              <button type="button" onClick={() => { setIdEmbarque(null); setCrt(""); setEmbarqueSeleccionado(null); }} className="rounded-xl bg-slate-600 px-4 py-2 text-xs font-black uppercase text-white">
                Quitar
              </button>
            )}
          </div>
        </div>
        {esInternacional && <p className="text-[10px] font-semibold text-[var(--yuriana-input-placeholder)]">Para viajes internacionales debe seleccionar o crear un CRT.</p>}
      </div>

      {mostrarNuevoEmbarque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase">Nuevo embarque</h3><button type="button" onClick={() => setMostrarNuevoEmbarque(false)}><X size={18} /></button></div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="CRT" required><input className={INPUT_CLASS} value={nuevoCrt} onChange={(event) => setNuevoCrt(event.target.value)} placeholder="N° CRT" /></Field>
              <Field label="Número de viajes" required><input type="number" min={1} step={1} className={INPUT_CLASS} value={nuevasUnidades || ""} onChange={(event) => setNuevasUnidades(Number(event.target.value))} /></Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setMostrarNuevoEmbarque(false)} className="rounded-xl bg-slate-600 px-5 py-2 text-xs font-black uppercase text-white">Cancelar</button><button type="button" onClick={guardarNuevoEmbarque} disabled={guardandoEmbarque} className="rounded-xl bg-[var(--yuriana-base-yellow)] px-5 py-2 text-xs font-black uppercase text-[var(--yuriana-base-black)]">{guardandoEmbarque ? "Guardando..." : "Crear embarque"}</button></div>
          </div>
        </div>
      )}

      {/* Sección: Facturas del servicio */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader icon={<FileText size={16} />} title="Facturas del servicio" />
          {!isReadOnly && <button type="button" onClick={() => setFacturaModalAbierto(true)} className="px-4 py-2 rounded-xl bg-[var(--yuriana-base-orange)] text-white text-xs font-black uppercase">+ Crear factura</button>}
        </div>
        {(initialData?.facturas?.length ?? 0) + facturasPendientes.length === 0 ? (
          <p className="text-xs text-[var(--yuriana-input-placeholder)] italic">No hay facturas agregadas a este servicio.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--yuriana-input-border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50 text-[var(--yuriana-base-gray-dark)] uppercase text-[10px] font-black">
                <tr><th className="px-3 py-2">N° Factura</th><th className="px-3 py-2 text-right">Monto Bs</th><th className="px-3 py-2">Transmitida</th><th className="px-3 py-2">Fotos</th><th className="px-3 py-2 text-center">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialData?.facturas?.filter((factura) => !facturasExistentesEliminadas.includes(factura.id_factura)).map((factura) => {
                  const editada = facturasExistentesEditadas[factura.id_factura];
                  return (
                  <tr key={factura.id_factura}>
                    <td className="px-3 py-2 font-bold">{editada?.factura_transporte ?? factura.factura_transporte ?? "-"}</td>
                    <td className="px-3 py-2 text-right">{new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(editada?.monto_factura ?? Number(factura.monto_factura))}</td>
                    <td className="px-3 py-2">{(editada?.transmitido ?? factura.transmitido) ? "Sí" : "No"}</td>
                    <td className="px-3 py-2">
                      {factura.fotos?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {factura.fotos.map((foto, fotoIndex) => (
                            <button key={foto.id_foto_factura} type="button" onClick={() => setFotoFacturaAmpliada(foto.url_foto)} className="group relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--yuriana-input-border)] bg-slate-50" title={`Ver foto ${fotoIndex + 1}`}>
                              <img src={foto.url_foto} alt={`Factura ${fotoIndex + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                            </button>
                          ))}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2"><TableActions onEdit={!isReadOnly ? () => abrirFacturaExistente(factura) : undefined} onDelete={!isReadOnly ? () => setFacturasExistentesEliminadas((prev) => [...prev, factura.id_factura]) : undefined} size={16} /></td>
                  </tr>
                  );
                })}
                {facturasPendientes.map((factura, index) => (
                  <tr key={`nueva-${index}`}>
                    <td className="px-3 py-2 font-bold">{factura.factura_transporte || "-"}</td>
                    <td className="px-3 py-2 text-right">{new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(factura.monto_factura)}</td>
                    <td className="px-3 py-2">{factura.transmitido ? "Sí" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span>{factura.archivos.length || "-"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2"><TableActions onEdit={!isReadOnly ? () => abrirFacturaPendiente(index) : undefined} onDelete={!isReadOnly ? () => setFacturasPendientes((prev) => prev.filter((_, itemIndex) => itemIndex !== index)) : undefined} size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {facturaModalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase">{facturaExistenteEnEdicion !== null ? "Editar factura" : "Crear factura"}</h3><button type="button" onClick={() => { limpiarBorradorFactura(); setFacturaModalAbierto(false); }}><X size={18} /></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Factura Transporte" required><input className={INPUT_CLASS} value={facturaTransporte} onChange={(e) => setFacturaTransporte(e.target.value)} placeholder="N° de factura" /></Field>
              <Field label="Monto Factura Bs" required><input type="number" min={0.01} step="any" className={INPUT_CLASS} value={montoFactura || ""} onChange={(e) => setMontoFactura(Number(e.target.value))} placeholder="0" /></Field>
              <Field label="Transmitir" required><select className={INPUT_CLASS} value={transmitirFactura ? "si" : "no"} onChange={(e) => setTransmitirFactura(e.target.value === "si")}><option value="si">Sí</option><option value="no">No</option></select></Field>
              <Field label={`Fotos Factura (máx. 5) · ${fotosFacturaExistentes.filter((foto) => !fotosFacturaEliminadas.includes(foto.id_foto_factura)).length + archivosFactura.length}/5`} optional>
                <input ref={facturaInputRef} type="file" accept="image/*,.pdf" multiple className={INPUT_CLASS} onChange={(e) => {
                  const seleccionados = Array.from(e.target.files ?? []).filter((file) => file.size <= 10 * 1024 * 1024);
                  const fotosExistentesVisibles = fotosFacturaExistentes.filter((foto) => !fotosFacturaEliminadas.includes(foto.id_foto_factura));
                  const disponibles = Math.max(0, 5 - fotosExistentesVisibles.length - archivosFactura.length);
                  const nuevos = seleccionados.slice(0, disponibles);
                  setArchivosFactura((prev) => [...prev, ...nuevos]);
                  setPreviewsFactura((prev) => [...prev, ...nuevos.map((file) => URL.createObjectURL(file))]);
                  e.target.value = "";
                }} disabled={fotosFacturaExistentes.filter((foto) => !fotosFacturaEliminadas.includes(foto.id_foto_factura)).length + archivosFactura.length >= 5} />
              </Field>
            </div>
            {(fotosFacturaExistentes.length > 0 || archivosFactura.length > 0) && <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
              {fotosFacturaExistentes.filter((foto) => !fotosFacturaEliminadas.includes(foto.id_foto_factura)).map((foto) => (
                <div key={foto.id_foto_factura} className="relative group rounded-xl border border-[var(--yuriana-input-border)] bg-slate-50 p-1.5">
                  <button type="button" onClick={() => setFotoFacturaAmpliada(foto.url_foto)} className="block aspect-square w-full overflow-hidden rounded-lg bg-white cursor-zoom-in">
                    <img src={foto.url_foto} alt="Foto existente de factura" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </button>
                  <button type="button" onClick={() => setFotosFacturaEliminadas((prev) => [...prev, foto.id_foto_factura])} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1.5 text-white shadow-md hover:bg-rose-700" title="Eliminar foto"><X size={12} /></button>
                  <p className="mt-1 text-center text-[9px] text-slate-500">Existente</p>
                </div>
              ))}
              {archivosFactura.map((archivo, index) => (
                <div key={`${archivo.name}-${index}`} className="relative group rounded-xl border border-[var(--yuriana-input-border)] bg-slate-50 p-1.5">
                  <div className="aspect-square overflow-hidden rounded-lg bg-white flex items-center justify-center">
                    {archivo.type.startsWith("image/") ? <button type="button" onClick={() => setFotoFacturaAmpliada(previewsFactura[index])} className="h-full w-full cursor-zoom-in"><img src={previewsFactura[index]} alt={archivo.name} className="h-full w-full object-cover" /></button> : <FileText size={24} className="text-[var(--yuriana-base-orange)]" />}
                  </div>
                  <button type="button" onClick={() => { URL.revokeObjectURL(previewsFactura[index]); setArchivosFactura((prev) => prev.filter((_, itemIndex) => itemIndex !== index)); setPreviewsFactura((prev) => prev.filter((_, itemIndex) => itemIndex !== index)); }} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1.5 text-white shadow-md opacity-90 hover:opacity-100 hover:bg-rose-700" title="Eliminar foto"><X size={12} /></button>
                  <p className="mt-1 truncate px-1 text-[9px] text-slate-500" title={archivo.name}>{archivo.name}</p>
                </div>
              ))}
            </div>}
            <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => { limpiarBorradorFactura(); setFacturaModalAbierto(false); }} className="px-5 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-xs font-black uppercase">Cancelar</button><button type="button" onClick={() => { if (!facturaTransporte.trim() || montoFactura <= 0) return toast.error("Completa el número y monto de la factura"); const factura = { factura_transporte: facturaTransporte.trim(), monto_factura: montoFactura, transmitido: transmitirFactura, archivos: archivosFactura }; if (facturaExistenteEnEdicion !== null) setFacturasExistentesEditadas((prev) => ({ ...prev, [facturaExistenteEnEdicion]: { factura_transporte: factura.factura_transporte, monto_factura: factura.monto_factura, transmitido: factura.transmitido, archivos: factura.archivos, fotos_eliminar: fotosFacturaEliminadas } })); else setFacturasPendientes((prev) => facturaEnEdicion === null ? [...prev, factura] : prev.map((item, index) => index === facturaEnEdicion ? factura : item)); limpiarBorradorFactura(); setFacturaModalAbierto(false); }} className="px-5 py-2 rounded-xl bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-[var(--yuriana-base-black)] text-xs font-black uppercase shadow-md">{facturaExistenteEnEdicion !== null ? "Actualizar factura" : facturaEnEdicion === null ? "Guardar factura" : "Actualizar factura"}</button></div>
          </div>
        </div>
      )}

      {fotoFacturaAmpliada && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-6" onClick={() => setFotoFacturaAmpliada(null)}>
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <img src={fotoFacturaAmpliada} alt="Factura ampliada" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" />
            <button type="button" onClick={() => setFotoFacturaAmpliada(null)} className="absolute -right-3 -top-3 rounded-full bg-white p-2 text-slate-700 shadow-lg hover:bg-rose-50 hover:text-rose-600" title="Cerrar vista ampliada"><X size={16} /></button>
          </div>
        </div>
      )}

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
          <Field label="Codigo_cliente" required>
            <SearchableCombobox
              options={listaClientes.map((c) => ({
                value: c.id_cliente,
                label: c.persona.nombre,
                sublabel: `CI: ${c.persona.ci} · ${c.razon_social ?? ""}`,
              }))}
              value={codigoCliente}
              selectedOptionValue={idCliente ?? undefined}
              placeholder="Seleccionar cliente..."
              loading={loadingListas}
              disabled={isReadOnly}
              onSelect={(opt) => {
                const c = listaClientes.find((x) => x.id_cliente === opt.value);
                if (c) {
                  setIdCliente(c.id_cliente);
                  setCiCliente(String(c.persona.ci));
                  setCodigoCliente((c as any).codigo_cliente ?? "");
                  setNombreCliente(c.persona.nombre);
                  setNitCliente(String(c.nit ?? ""));
                  setRazonSocial(c.razon_social ?? "");
                }
              }}
            />
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
          <Field label="Ci Conductor" required>
            <SearchableCombobox
              options={listaAsignaciones.map((a) => ({
                value: a.id_asignacion,
                label: a.conductor?.persona?.nombre ?? "",
                sublabel: `CI: ${a.conductor?.persona?.ci ?? ""} · ${a.tracto?.placa ?? ""}`,
              }))}
              value={ciConductor}
              selectedOptionValue={idAsignacion ?? undefined}
              placeholder="Seleccionar conductor..."
              loading={loadingListas}
              disabled={isReadOnly}
              onSelect={(opt) => {
                const a = listaAsignaciones.find((x) => x.id_asignacion === opt.value);
                if (a) {
                  setIdAsignacion(a.id_asignacion);
                  setCiConductor(String(a.conductor?.persona?.ci ?? ""));
                  setNombreConductor(a.conductor?.persona?.nombre ?? "");
                  setPlacaTracto(a.tracto?.placa ?? "");
                  setTipoUnidad((a.tracto as any)?.categoria?.tipo_categoria ?? "");
                }
              }}
            />
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

      {/* Sección: Datos del Colaborador */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<UserCheck size={16} />} title="Datos del Colaborador" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="Ci Colaborador" optional>
            <SearchableCombobox
              options={listaColaboradores.map((c) => ({
                value: c.id_colaborador,
                label: c.persona.nombre,
                sublabel: `${c.persona.ci ? `CI: ${c.persona.ci} · ` : ""}${c.agencia ?? ""}`,
              }))}
              value={ciColaborador}
              selectedOptionValue={idColaborador ?? undefined}
              placeholder="Seleccionar colaborador..."
              loading={loadingListas}
              disabled={isReadOnly}
              onSelect={(opt) => {
                const c = listaColaboradores.find((x) => x.id_colaborador === opt.value);
                if (c) {
                  setIdColaborador(c.id_colaborador);
                  setCiColaborador(c.persona.ci ? String(c.persona.ci) : c.persona.nombre);
                  setNombreColaborador(c.persona.nombre);
                  setAgenciaColaborador(c.agencia ?? "");
                }
              }}
            />
            {idColaborador && !isReadOnly && (
              <button type="button"
                onClick={() => { setIdColaborador(null); setCiColaborador(""); setNombreColaborador(""); setAgenciaColaborador(""); setMontoColaborador(0); }}
                className="text-[9px] text-rose-400 hover:text-rose-600 font-bold self-start ml-1 transition-colors">
                ✕ Quitar colaborador
              </button>
            )}
          </Field>
          <Field label="Nombre Colaborador">
            <input className={INPUT_CLASS} value={nombreColaborador} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Agencia">
            <input className={INPUT_CLASS} value={agenciaColaborador} disabled readOnly placeholder="-" />
          </Field>
          <Field label="Monto" optional>
            <input type="number" min={0} step="any" className={INPUT_CLASS} value={montoColaborador || ""} onChange={(e) => setMontoColaborador(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
        </div>
      </div>

      {/* Sección: Tipo de cambio */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<DollarSign size={16} />} title="Tipo de Cambio" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <Field label="Seleccione la Moneda" required>
            <select className={INPUT_CLASS} value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} disabled={isReadOnly}>
              <option value={Moneda.DOLAR}>DOLAR</option>
              <option value={Moneda.BOLIVIANOS}>BOLIVIANOS</option>
            </select>
          </Field>
          {moneda === Moneda.DOLAR && (
            <Field label="Tipo de Cambio Bs" required>
              <input type="number" min={0.01} step="any" className={INPUT_CLASS} value={tipoCambio || ""} onChange={(e) => setTipoCambio(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
            </Field>
          )}
        </div>
      </div>

      {/* Sección: Datos del Flete */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-5">
        <SectionHeader icon={<Truck size={16} />} title="Datos del Flete" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <Field label={`Monto Flete (${moneda === Moneda.DOLAR ? "Dólar" : "Bs"})`} required>
            <input type="number" min={0.01} step="any" className={INPUT_CLASS} value={flete || ""} onChange={(e) => setFlete(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
          <Field label={`Flete Adicional (${moneda === Moneda.DOLAR ? "Dólar" : "Bs"})`} optional>
            <div className="flex items-center gap-2">
              <div className="flex bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl p-0.5">
                <button type="button" onClick={() => !isReadOnly && setOperacionFleteAdicional('SUMA')}
                  className={`px-2 py-1 rounded-lg text-base font-bold transition-all ${operacionFleteAdicional === 'SUMA' ? 'bg-emerald-500 text-white' : 'text-[var(--yuriana-input-placeholder)] hover:bg-slate-100'}`}
                  disabled={isReadOnly}>
                  +
                </button>
                <button type="button" onClick={() => !isReadOnly && setOperacionFleteAdicional('RESTA')}
                  className={`px-2 py-1 rounded-lg text-base font-bold transition-all ${operacionFleteAdicional === 'RESTA' ? 'bg-rose-500 text-white' : 'text-[var(--yuriana-input-placeholder)] hover:bg-slate-100'}`}
                  disabled={isReadOnly}>
                  -
                </button>
              </div>
              <input type="number" min={0} step="any" className={INPUT_CLASS} value={fleteAdicional || ""} onChange={(e) => setFleteAdicional(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
            </div>
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
            <input type="date" className={INPUT_CLASS} value={fechaFin} onChange={(e) => {
              const nuevaFechaFin = e.target.value;
              setFechaFin(nuevaFechaFin);
              if (!nuevaFechaFin) setPeriodoLiquidacion(0);
            }} disabled={isReadOnly} />
          </Field>
          <Field label="Período de Liquidación (días)" required={tieneFechaFin} optional={!tieneFechaFin}>
            <input type="number" min={1} step={1} className={INPUT_CLASS} value={periodoLiquidacion || ""} onChange={(e) => setPeriodoLiquidacion(Number(e.target.value))} disabled={isReadOnly} placeholder="0" />
          </Field>
          <Field label="Fecha Límite Pago">
            <input type="date" className={INPUT_CLASS} disabled readOnly
              value={fechaFin && periodoLiquidacion > 0
                ? toDateInputBolivia(new Date(new Date(fechaFin).getTime() + periodoLiquidacion * 86400000))
                : ""
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
            optional
            existingUrl={initialData?.comprobante_pago} />
          <Field label="Fecha de Pago" optional>
            <input type="date" className={INPUT_CLASS} value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} disabled={isReadOnly} />
          </Field>
          <Field label="Estado de Pago">
            <input className={`${INPUT_CLASS} uppercase`} disabled readOnly
              value={(fechaPago || voucher || initialData?.comprobante_pago) ? 'PAGADO' : (initialData?.estado_pago ?? "PENDIENTE")} />
          </Field>
          <Field label="Estado de Viaje">
            <input className={`${INPUT_CLASS} uppercase`} disabled readOnly
              value={tieneFechaFin ? "FINALIZADO" : "EN_CURSO"} />
          </Field>
        </div>
      </div>

      <FormActions onCancel={onCancel} isReadOnly={isReadOnly} isSubmitting={saving} isEditing={isEdit} onSubmit={handleSubmit} entityLabel="Viaje" />
    </div>
  );
};
