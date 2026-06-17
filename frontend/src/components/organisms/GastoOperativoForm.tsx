"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, Trash2, Info, Truck } from "lucide-react";
import { toast } from "sonner";
import { FormActions } from "@/components/atoms/FormActions";
import { TipoGastoOperativo, GastoOperativo, ItemGastoForm } from "@/types/gasto.types";
import { guardarGastoOperativo, editarGastoOperativo } from "@/lib/api/gasto.api";
import { getUnidades } from "@/lib/api/unidad.api";
import type { Unidad } from "@/types/unidad.types";
import { ModuleField } from "@/components/molecules/ModuleField";
import { SearchableCombobox } from "@/components/molecules/SearchableCombobox";

// Clases compartidas con ModuleField para mantener consistencia visual
const FIELD_LABEL_CLASS =
  "text-[10px] font-black text-[var(--yuriana-input-label)] uppercase tracking-widest ml-1 flex items-center gap-1";
const INPUT_CLASS =
  "w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-2 px-3 text-xs font-medium text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

interface DatosUnidadFields {
  tipo_unidad: string;
  modelo: string;
  marca: string;
}

const TIPOS_GASTO = Object.values(TipoGastoOperativo);

const TIPO_COLOR: Record<string, string> = {
  [TipoGastoOperativo.MANTENIMIENTO]: "text-amber-500",
  [TipoGastoOperativo.COMBUSTIBLE]: "text-blue-500",
  [TipoGastoOperativo.REPUESTOS]: "text-slate-500",
};

interface Props {
  initialData?: GastoOperativo | null;
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


const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

export const GastoOperativoForm = ({ initialData, isReadOnly = false, onCancel, onSuccess }: Props) => {
  const isEdit = !!initialData;

  // RHF para los campos auto-populados de la unidad (tipo, modelo, marca)
  const { register, setValue } = useForm<DatosUnidadFields>({
    defaultValues: { tipo_unidad: "", modelo: "", marca: "" },
  });

  const [placa, setPlaca] = useState("");
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
  const [todasUnidades, setTodasUnidades] = useState<Unidad[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  const [items, setItems] = useState<ItemGastoForm[]>([]);
  const [newFecha, setNewFecha] = useState("");
  const [newTipo, setNewTipo] = useState<string>(TipoGastoOperativo.MANTENIMIENTO);
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newMonto, setNewMonto] = useState<number>(0);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingUnidades(true);
    getUnidades({}).then(setTodasUnidades).catch(() => {}).finally(() => setLoadingUnidades(false));
  }, []);

  useEffect(() => {
    if (initialData) {
      setPlaca(initialData.unidad?.placa ?? "");
      setSelectedUnidad(initialData.unidad as unknown as Unidad);
      setValue("tipo_unidad", initialData.unidad?.categoria?.tipo_categoria ?? "");
      setValue("modelo", initialData.unidad?.modelo ?? "");
      setValue("marca", initialData.unidad?.marca ?? "");
      setItems([{
        _key: String(initialData.id_gasto_operativo),
        fecha: initialData.gasto?.fecha?.slice(0, 10) ?? "",
        tipo_gasto: initialData.tipo_gasto,
        descripcion: initialData.gasto?.descripcion ?? "",
        monto: Number(initialData.gasto?.monto ?? 0),
      }]);
    }
  }, [initialData, setValue]);

  const handleSelectUnidad = (u: Unidad) => {
    setPlaca(u.placa);
    setSelectedUnidad(u);
    setValue("tipo_unidad", u.categoria?.tipo_categoria ?? "");
    setValue("modelo", u.modelo ?? "");
    setValue("marca", u.marca ?? "");
  };

  const handleAddItem = () => {
    if (!newFecha) return toast.error("Selecciona una fecha");
    if (!newDescripcion.trim()) return toast.error("Ingresa una descripción");
    if (newMonto <= 0) return toast.error("El monto debe ser mayor a 0");
    setItems((prev) => [...prev, {
      _key: `${Date.now()}-${Math.random()}`,
      fecha: newFecha,
      tipo_gasto: newTipo,
      descripcion: newDescripcion.trim(),
      monto: newMonto,
    }]);
    setNewDescripcion("");
    setNewMonto(0);
    setNewFecha("");
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  // Totales por tipo de gasto para el panel derecho
  const totalesPorTipo = TIPOS_GASTO.reduce((acc, tipo) => {
    acc[tipo] = items.filter((i) => i.tipo_gasto === tipo).reduce((s, i) => s + Number(i.monto), 0);
    return acc;
  }, {} as Record<string, number>);

  const totalGeneral = items.reduce((s, i) => s + Number(i.monto), 0);

  const handleSubmit = async () => {
    if (!selectedUnidad) return toast.error("Busca y selecciona una unidad por su placa");
    if (items.length === 0) return toast.error("Agrega al menos un gasto");

    try {
      setSaving(true);
      if (isEdit && initialData) {
        // Edición: actualiza el único registro existente
        const item = items[0];
        await editarGastoOperativo(initialData.id_gasto_operativo, {
          tipo_gasto: item.tipo_gasto,
          fecha: item.fecha,
          descripcion: item.descripcion.trim().toUpperCase(),
          monto: item.monto,
        });
        toast.success("Gasto operativo actualizado correctamente.");
      } else {
        await guardarGastoOperativo({
          tipo_pestaña: "OPERATIVO",
          placa: selectedUnidad.placa.toUpperCase(),
          items: items.map(({ fecha, tipo_gasto, descripcion, monto }) => ({
            fecha,
            tipo_gasto,
            descripcion: descripcion.trim().toUpperCase(),
            monto,
          })),
        });
        toast.success("Gastos operativos registrados correctamente.");
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
      {/* Card superior: título + datos de la unidad */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-8">
        <div className="flex items-center gap-3">
          <Info size={20} className="text-[var(--yuriana-section-icon)]" />
          <h2 className="text-xl font-black text-[var(--yuriana-base-gray-dark)] uppercase tracking-tight">
            {isEdit ? "Editar Gasto Operativo" : "Registrar los Gastos Operativos"}
          </h2>
        </div>

        <div>
          <SectionHeader icon={<Truck size={16} />} title="Datos de la Unidad" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Placa — campo especial con botón de búsqueda.
                Usa FIELD_LABEL_CLASS e INPUT_CLASS de ModuleField para consistencia visual. */}
            <div className="flex flex-col gap-1 w-full text-left">
              <label className={FIELD_LABEL_CLASS}>Placa</label>
              <SearchableCombobox
                options={todasUnidades.map((u) => ({
                  value: u.placa,
                  label: u.placa,
                  sublabel: `${u.categoria?.tipo_categoria ?? ""} · ${u.marca} ${u.modelo}`,
                }))}
                value={placa}
                placeholder="Seleccionar placa..."
                loading={loadingUnidades}
                disabled={isReadOnly || isEdit}
                onSelect={(opt) => {
                  const u = todasUnidades.find((x) => x.placa === opt.value);
                  if (u) handleSelectUnidad(u);
                }}
              />
            </div>

            {/* Campos auto-populados con ModuleField + RHF */}
            <ModuleField label="Tipo Unidad" name="tipo_unidad" register={register} disabled={true} placeholder="-" />
            <ModuleField label="Modelo"      name="modelo"      register={register} disabled={true} placeholder="-" />
            <ModuleField label="Marca"       name="marca"       register={register} disabled={true} placeholder="-" />
          </div>
        </div>
      </div>

      {/* Sección inferior: tabla de gastos + panel de totales */}
      <div className="flex gap-6 items-start">
        {/* Izquierda: form de entrada + tabla de ítems */}
        <div className="flex-1 bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="bg-[var(--yuriana-base-orange)] px-6 py-3 flex justify-between items-center">
            <span className="text-white font-black text-sm uppercase tracking-wide">Registrar nuevo gasto</span>
            {!isReadOnly && (
              <span className="text-white/70 text-xs font-semibold italic">Nueva entrada</span>
            )}
          </div>

          <div className="p-6 space-y-4">
            {!isReadOnly && (
              <div className="grid grid-cols-[130px_150px_1fr_120px_auto] gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1">Fecha</label>
                  <input
                    type="date"
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1">Tipo de Gasto</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value)}
                    className={`${INPUT_CLASS} capitalize`}
                  >
                    {TIPOS_GASTO.map((t) => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1">Descripción</label>
                  <input
                    type="text"
                    value={newDescripcion}
                    onChange={(e) => setNewDescripcion(e.target.value)}
                    placeholder="Ej: Cambio de aceite"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1">Monto</label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    value={newMonto || ""}
                    onChange={(e) => setNewMonto(Number(e.target.value))}
                    placeholder="0"
                    className={INPUT_CLASS}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 bg-[var(--yuriana-base-yellow)] hover:opacity-90 text-black font-black px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap text-xs h-[34px]"
                >
                  <PlusCircle size={14} />
                  Añadir Gasto
                </button>
              </div>
            )}

            {/* Tabla de ítems agregados */}
            <div className="rounded-2xl overflow-hidden border border-[var(--yuriana-base-orange)]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-2.5">Fecha</th>
                    <th className="px-4 py-2.5">Gasto</th>
                    <th className="px-4 py-2.5">Descripción</th>
                    <th className="px-4 py-2.5 text-right">Monto Bs</th>
                    {!isReadOnly && <th className="px-4 py-2.5 text-center">—</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100 text-xs">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={isReadOnly ? 4 : 5} className="py-10 text-center text-[var(--yuriana-input-placeholder)] italic text-xs">
                        Sin gastos registrados
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item._key} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-gray-600">{item.fecha}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-black text-[10px] uppercase text-[var(--yuriana-base-orange)]">{item.tipo_gasto}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[var(--yuriana-base-gray-dark)] font-medium">{item.descripcion}</td>
                        <td className="px-4 py-2.5 text-right font-black text-[var(--yuriana-base-gray-dark)]">
                          {fmt(item.monto)}
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-2.5 text-center">
                            <button type="button" onClick={() => handleRemoveItem(item._key)} className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Derecha: panel de totales por categoría */}
        <div className="w-52 shrink-0 bg-[var(--yuriana-card-bg)] rounded-3xl border-2 border-[var(--yuriana-input-border)] shadow-lg p-5 flex flex-col gap-3 sticky top-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-base-yellow)]">Total Gastos</p>

          <div className="space-y-3">
            {TIPOS_GASTO.map((tipo) =>
              totalesPorTipo[tipo] > 0 ? (
                <div key={tipo}>
                  <p className={`text-[10px] uppercase font-black tracking-wider ${TIPO_COLOR[tipo] ?? "text-gray-500"}`}>{tipo}</p>
                  <p className="text-xl font-black text-[var(--yuriana-base-gray-dark)]">
                    {fmt(totalesPorTipo[tipo])}{" "}
                    <span className="text-[10px] font-bold text-[var(--yuriana-input-placeholder)]">Bs</span>
                  </p>
                </div>
              ) : null
            )}
          </div>

          {totalGeneral > 0 ? (
            <>
              <div className="h-px bg-[var(--yuriana-input-border)]" />
              <div>
                <p className="text-[10px] text-[var(--yuriana-input-placeholder)] font-semibold uppercase">Total</p>
                <p className="text-2xl font-black text-[var(--yuriana-base-orange)]">
                  {fmt(totalGeneral)}{" "}
                  <span className="text-xs font-bold text-[var(--yuriana-input-placeholder)]">Bs.</span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-[10px] text-[var(--yuriana-input-placeholder)] italic">Sin gastos aún</p>
          )}
        </div>
      </div>

      <FormActions onCancel={onCancel} isReadOnly={isReadOnly} isSubmitting={saving} onSubmit={handleSubmit} />
    </div>
  );
};
