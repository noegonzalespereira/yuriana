"use client";
import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Info, Users, Wallet, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { TipoGastoServicio, ItemGastoForm, ServicioResumen, GastosServicio } from "@/types/gasto.types";
import { guardarGastoServicio } from "@/lib/api/gasto.api";
import { getServicios } from "@/lib/api/servicio.api";

const MONEDAS = [
  { value: "BS", label: "BS" },
  { value: "USD", label: "USD" },
  { value: "UYU", label: "UYU" },
  { value: "ARG", label: "ARG" },
];

const TIPOS_GASTO = Object.values(TipoGastoServicio);

interface Props {
  initialData?: GastosServicio | null;
  isReadOnly?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-[var(--yuriana-section-icon)]">{icon}</span>
    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--yuriana-base-gray-dark)]">{title}</h3>
    <div className="flex-1 h-px bg-[var(--yuriana-input-border)]" />
  </div>
);

const ReadField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">{label}</label>
    <div className="bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--yuriana-base-gray-dark)] min-h-[42px] flex items-center">
      {value || <span className="text-[var(--yuriana-input-placeholder)]">-</span>}
    </div>
  </div>
);

const fmt = (n: number, decimals = 2) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: decimals }).format(n);

export const GastoServicioForm = ({ initialData, isReadOnly = false, onCancel, onSuccess }: Props) => {
  const [servicios, setServicios] = useState<ServicioResumen[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<ServicioResumen | null>(null);

  const [moneda, setMoneda] = useState("UYU");
  const [tipoCambio, setTipoCambio] = useState<number>(0.17);
  const [viatico, setViatico] = useState<number>(0);

  const [items, setItems] = useState<ItemGastoForm[]>([]);
  const [newFecha, setNewFecha] = useState("");
  const [newTipo, setNewTipo] = useState<string>(TipoGastoServicio.PEAJES);
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newMonto, setNewMonto] = useState<number>(0);

  const [saving, setSaving] = useState(false);

  const totalGastos = items.reduce((acc, i) => acc + Number(i.monto), 0);
  const totalGastosBs = totalGastos * tipoCambio;
  const viaticoBs = viatico * tipoCambio;
  const saldo = viatico - totalGastos;
  const saldoBs = saldo * tipoCambio;

  const loadServicios = useCallback(async () => {
    try {
      const data = await getServicios();
      setServicios(data);
    } catch {
      toast.error("No se pudieron cargar los servicios");
    }
  }, []);

  useEffect(() => {
    loadServicios();
  }, [loadServicios]);

  useEffect(() => {
    if (initialData) {
      const s = servicios.find((sv) => sv.id_servicio === initialData.id_servicio) ?? null;
      setSelectedServicio(s);
      setMoneda(initialData.moneda);
      setTipoCambio(Number(initialData.tipo_cambio));
      setViatico(Number(initialData.viatico_entregado));
      if (initialData.detalles) {
        setItems(
          initialData.detalles.map((d) => ({
            _key: String(d.id_detalle_servicio),
            fecha: d.gasto?.fecha?.slice(0, 10) ?? "",
            tipo_gasto: d.tipo_gasto,
            descripcion: d.gasto?.descripcion ?? "",
            monto: Number(d.gasto?.monto ?? 0),
          }))
        );
      }
    }
  }, [initialData, servicios]);

  useEffect(() => {
    if (moneda === "BS") setTipoCambio(1);
  }, [moneda]);

  const handleSelectServicio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const sv = servicios.find((s) => s.id_servicio === id) ?? null;
    setSelectedServicio(sv);
  };

  const handleAddItem = () => {
    if (!newFecha) return toast.error("Selecciona una fecha");
    if (!newDescripcion.trim()) return toast.error("Ingresa una descripción");
    if (newMonto <= 0) return toast.error("El monto debe ser mayor a 0");

    setItems((prev) => [
      ...prev,
      {
        _key: `${Date.now()}-${Math.random()}`,
        fecha: newFecha,
        tipo_gasto: newTipo,
        descripcion: newDescripcion.trim(),
        monto: newMonto,
      },
    ]);
    setNewDescripcion("");
    setNewMonto(0);
    setNewFecha("");
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const handleSubmit = async () => {
    if (!selectedServicio) return toast.error("Selecciona un servicio/viaje");
    if (viatico <= 0) return toast.error("El viático debe ser mayor a 0");
    if (items.length === 0) return toast.error("Agrega al menos un gasto");

    try {
      setSaving(true);
      await guardarGastoServicio({
        tipo_pestaña: "servicio",
        codigo_servicio: selectedServicio.codigo_servicio.toUpperCase(),
        moneda: moneda.toUpperCase(),
        tipo_cambio: tipoCambio,
        viatico_entregado: viatico,
        items: items.map(({ fecha, tipo_gasto, descripcion, monto }) => ({
          fecha,
          tipo_gasto: tipo_gasto.toUpperCase(),
          descripcion: descripcion.trim().toUpperCase(),
          monto,
        })),
      });
      toast.success("Gasto registrado", {
        description: "Los costos del servicio fueron guardados correctamente.",
      });
      onSuccess();
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const conductor = selectedServicio?.asignacion?.conductor?.persona;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header card */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-8">

        {/* Title */}
        <div className="flex items-center gap-3">
          <Info size={20} className="text-[var(--yuriana-section-icon)]" />
          <h2 className="text-xl font-black text-[var(--yuriana-base-gray-dark)] uppercase tracking-tight">
            Registrar los gastos del viaje
          </h2>
        </div>

        {/* ── Datos del viaje ── */}
        <div>
          <SectionHeader icon={<ClipboardList size={16} />} title="Datos del viaje y conductor" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">
                ID Viaje
              </label>
              {isReadOnly ? (
                <ReadField label="" value={selectedServicio?.codigo_servicio ?? "-"} />
              ) : (
                <select
                  value={selectedServicio?.id_servicio ?? ""}
                  onChange={handleSelectServicio}
                  className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors font-medium min-h-[42px]"
                >
                  <option value="">Introduce el id_viaje</option>
                  {servicios.map((s) => (
                    <option key={s.id_servicio} value={s.id_servicio}>
                      {s.codigo_servicio}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <ReadField label="Tipo viaje" value={selectedServicio?.categoria?.nombre ?? "-"} />
            <ReadField label="Origen" value={selectedServicio?.origen ?? ""} />
            <ReadField label="Destino" value={selectedServicio?.destino ?? ""} />
          </div>
        </div>

        {/* ── Datos del conductor ── */}
        <div>
          <SectionHeader icon={<Users size={16} />} title="Datos del Conductor" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReadField label="CI" value={conductor?.ci?.toString() ?? "-"} />
            <ReadField label="Nombre" value={conductor?.nombre ?? "--"} />
            <ReadField label="Teléfono" value={conductor?.telefono ?? "-"} />
            <ReadField label="Correo" value={conductor?.correo ?? "-"} />
          </div>
        </div>

        {/* ── Moneda y Viático ── */}
        <div>
          <SectionHeader icon={<Wallet size={16} />} title="Tipo de moneda y Viático" />
          <div className="grid grid-cols-[1fr_110px_100px_auto_120px] gap-3 items-end max-w-3xl">
            {/* Viático */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">
                Viático del conductor
              </label>
              <input
                type="number"
                min={0}
                step="any"
                disabled={isReadOnly}
                value={viatico || ""}
                onChange={(e) => setViatico(Number(e.target.value))}
                placeholder="0"
                className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors disabled:bg-slate-50"
              />
            </div>
            {/* Moneda */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">
                Moneda
              </label>
              <select
                disabled={isReadOnly}
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors disabled:bg-slate-50"
              >
                {MONEDAS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            {/* T/C */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">
                T/C
              </label>
              <input
                type="number"
                min={0.0001}
                step="any"
                disabled={isReadOnly || moneda === "BS"}
                value={tipoCambio || ""}
                onChange={(e) => setTipoCambio(Number(e.target.value))}
                placeholder="0.17"
                title="Tipo de cambio a Bolivianos"
                className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors disabled:bg-slate-100 disabled:text-slate-400 text-center"
              />
            </div>
            {/* Equals */}
            <span className="text-slate-400 font-black text-lg pb-2.5">=</span>
            {/* Total Bs */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">
                Total Bs
              </label>
              <div className="flex items-center gap-1 bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl px-4 py-2.5 min-h-[42px]">
                <span className="text-sm font-black text-[var(--yuriana-base-gray-dark)]">{fmt(viaticoBs)}</span>
                <span className="text-[10px] font-bold text-[var(--yuriana-input-placeholder)] ml-1">Bs</span>
              </div>
            </div>
          </div>
          {moneda !== "BS" && (
            <p className="text-[10px] text-[var(--yuriana-input-placeholder)] font-medium mt-2">
              T/C = tipo de cambio a bolivianos (ej: 0.17 para UYU)
            </p>
          )}
        </div>
      </div>

      {/* ── Registrar gastos + Saldo ── */}
      <div className="flex gap-6 items-start">
        {/* Left: gastos table */}
        <div className="flex-1 bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl overflow-hidden">
          {/* Orange bar */}
          <div className="bg-[var(--yuriana-base-orange)] px-6 py-3 flex justify-between items-center">
            <span className="text-white font-black text-sm uppercase tracking-wide">Registrar los gastos</span>
            {!isReadOnly && (
              <span className="text-white/70 text-xs font-semibold italic">Nueva entrada</span>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Input row */}
            {!isReadOnly && (
              <div className="grid grid-cols-[140px_160px_1fr_130px_auto] gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Fecha</label>
                  <input
                    type="date"
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Tipo de gasto</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value)}
                    className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors capitalize"
                  >
                    {TIPOS_GASTO.map((t) => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Descripción</label>
                  <input
                    type="text"
                    value={newDescripcion}
                    onChange={(e) => setNewDescripcion(e.target.value)}
                    placeholder={newTipo}
                    className="bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)]">Monto</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={newMonto || ""}
                      onChange={(e) => setNewMonto(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[var(--yuriana-input-border-focus)] transition-colors"
                    />
                    <select
                      value={moneda}
                      disabled
                      className="bg-slate-50 border border-[var(--yuriana-input-border)] rounded-xl px-2 py-2 text-xs font-bold outline-none"
                    >
                      {MONEDAS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap text-sm h-[42px]"
                >
                  <PlusCircle size={16} />
                  Añadir Gasto
                </button>
              </div>
            )}

            {/* Items table */}
            <div className="rounded-2xl overflow-hidden border border-[var(--yuriana-base-orange)]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-5 py-3">Gasto</th>
                    <th className="px-5 py-3">Descripción</th>
                    <th className="px-5 py-3 text-right">Monto</th>
                    <th className="px-5 py-3 text-right">Monto Bs</th>
                    {!isReadOnly && <th className="px-5 py-3 text-center">—</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100 text-sm">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={isReadOnly ? 4 : 5} className="py-8 text-center text-[var(--yuriana-input-placeholder)] italic text-xs">
                        Sin gastos registrados
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item._key} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-black text-[10px] uppercase text-[var(--yuriana-base-orange)]">{item.tipo_gasto}</span>
                        </td>
                        <td className="px-5 py-3 text-[var(--yuriana-base-yellow)] font-semibold text-xs">{item.descripcion}</td>
                        <td className="px-5 py-3 text-right font-bold text-gray-700">
                          {fmt(item.monto)} <span className="text-[10px] text-[var(--yuriana-input-placeholder)]">{moneda}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-black text-[var(--yuriana-base-gray-dark)]">
                          {fmt(item.monto * tipoCambio)}
                        </td>
                        {!isReadOnly && (
                          <td className="px-5 py-3 text-center">
                            <button type="button" onClick={() => handleRemoveItem(item._key)} className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                  {items.length > 0 && (
                    <tr className="bg-[var(--yuriana-base-orange)]/10 font-black">
                      <td colSpan={2} className="px-5 py-3 text-[10px] uppercase tracking-widest text-[var(--yuriana-base-orange)]">
                        Total Gastos
                      </td>
                      <td className="px-5 py-3 text-right text-[var(--yuriana-base-gray-dark)]">
                        {fmt(totalGastos)} <span className="text-[10px] text-[var(--yuriana-input-placeholder)]">{moneda}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-[var(--yuriana-base-gray-dark)]">{fmt(totalGastosBs)}</td>
                      {!isReadOnly && <td />}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Saldo panel */}
        <div className="w-56 shrink-0 bg-[var(--yuriana-card-bg)] rounded-3xl border-2 border-[var(--yuriana-input-border)] shadow-lg p-5 flex flex-col gap-4 sticky top-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-base-yellow)]">Saldo</p>
          <div className="space-y-1">
            <p className="text-xs text-[var(--yuriana-input-placeholder)] font-semibold">Saldo</p>
            <p className="text-2xl font-black text-[var(--yuriana-base-gray-dark)]">
              {fmt(saldo)} <span className="text-xs font-bold text-[var(--yuriana-input-placeholder)]">{moneda}</span>
            </p>
          </div>
          <div className="h-px bg-[var(--yuriana-input-border)]" />
          <div className="space-y-1">
            <p className="text-xs text-[var(--yuriana-input-placeholder)] font-semibold">Saldo</p>
            <p className="text-2xl font-black text-[var(--yuriana-base-orange)]">
              {fmt(saldoBs)} <span className="text-xs font-bold text-[var(--yuriana-input-placeholder)]">Bs.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 rounded-2xl font-bold text-sm bg-[var(--yuriana-btn-cancel-bg)] text-[var(--yuriana-btn-cancel-text)] hover:opacity-90 transition-all active:scale-95"
        >
          Cancelar
        </button>
        {!isReadOnly && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-3 rounded-2xl font-black text-sm bg-[var(--yuriana-btn-save-bg)] text-[var(--yuriana-btn-save-text)] hover:opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        )}
      </div>
    </div>
  );
};
