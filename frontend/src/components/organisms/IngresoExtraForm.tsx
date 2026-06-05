"use client";
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Info, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { IngresoExtra, ItemIngresoForm } from "@/types/ingreso-extra.types";
import { crearIngreso, editarIngreso } from "@/lib/api/ingreso-extra.api";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(n);

const INPUT_CLASS =
  "w-full bg-[var(--yuriana-input-bg)] border border-[var(--yuriana-input-border)] rounded-xl py-2 px-3 text-xs font-medium text-[var(--yuriana-input-text)] placeholder:text-[var(--yuriana-input-placeholder)] outline-none focus:border-[var(--yuriana-input-border-focus)] transition-all";

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-[var(--yuriana-section-icon)]">{icon}</span>
    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--yuriana-base-gray-dark)]">{title}</h3>
    <div className="flex-1 h-px bg-[var(--yuriana-input-border)]" />
  </div>
);

interface Props {
  initialData?: IngresoExtra | null;
  isReadOnly?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const IngresoExtraForm = ({ initialData, isReadOnly = false, onCancel, onSuccess }: Props) => {
  const isEdit = !!initialData;

  const [items, setItems] = useState<ItemIngresoForm[]>([]);
  const [newFecha, setNewFecha] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newMonto, setNewMonto] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setItems([{
        _key: String(initialData.id_ingreso_extra),
        fecha: initialData.fecha?.slice(0, 10) ?? "",
        descripcion: initialData.descripcion ?? "",
        monto: Number(initialData.monto ?? 0),
      }]);
    }
  }, [initialData]);

  const handleAddItem = () => {
    if (!newFecha) return toast.error("Selecciona una fecha");
    if (!newDescripcion.trim()) return toast.error("Ingresa una descripción");
    if (newMonto <= 0) return toast.error("El monto debe ser mayor a 0");
    setItems((prev) => [
      ...prev,
      {
        _key: `${Date.now()}-${Math.random()}`,
        fecha: newFecha,
        descripcion: newDescripcion.trim(),
        monto: newMonto,
      },
    ]);
    setNewFecha("");
    setNewDescripcion("");
    setNewMonto(0);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const totalGeneral = items.reduce((s, i) => s + Number(i.monto), 0);

  const handleSubmit = async () => {
    if (items.length === 0) return toast.error("Agrega al menos un ingreso");
    try {
      setSaving(true);
      if (isEdit && initialData) {
        const item = items[0];
        await editarIngreso(initialData.id_ingreso_extra, {
          fecha: item.fecha,
          descripcion: item.descripcion.trim().toUpperCase(),
          monto: item.monto,
        });
        toast.success("Ingreso extra actualizado correctamente.");
      } else {
        for (const item of items) {
          await crearIngreso({
            fecha: item.fecha,
            descripcion: item.descripcion.trim().toUpperCase(),
            monto: item.monto,
          });
        }
        toast.success(
          items.length === 1
            ? "Ingreso extra registrado correctamente."
            : `${items.length} ingresos extras registrados correctamente.`
        );
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
      {/* Card principal */}
      <div className="bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Info size={20} className="text-[var(--yuriana-section-icon)]" />
          <h2 className="text-xl font-black text-[var(--yuriana-base-gray-dark)] uppercase tracking-tight">
            {isEdit ? "Editar Ingreso Extra" : "Registrar Ingresos Extras"}
          </h2>
        </div>
        <SectionHeader icon={<TrendingUp size={16} />} title="Ingresos adicionales de la empresa" />
      </div>

      {/* Tabla de ítems + panel totales */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 bg-[var(--yuriana-card-bg)] rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="bg-[var(--yuriana-base-orange)] px-6 py-3 flex justify-between items-center">
            <span className="text-white font-black text-sm uppercase tracking-wide">Registrar nuevo ingreso</span>
            {!isReadOnly && <span className="text-white/70 text-xs font-semibold italic">Nueva entrada</span>}
          </div>

          <div className="p-6 space-y-4">
            {!isReadOnly && (
              <div className="grid grid-cols-[140px_1fr_130px_auto] gap-3 items-end">
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
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1">Descripción</label>
                  <input
                    type="text"
                    value={newDescripcion}
                    onChange={(e) => setNewDescripcion(e.target.value)}
                    placeholder="Ej: Comisión por servicio especial"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--yuriana-input-label)] ml-1">Monto Bs</label>
                  <input
                    type="number"
                    min={0}
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
                  Añadir
                </button>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-[var(--yuriana-base-orange)]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--yuriana-base-orange)] text-white uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-2.5">Fecha</th>
                    <th className="px-4 py-2.5">Descripción</th>
                    <th className="px-4 py-2.5 text-right">Monto Bs</th>
                    {!isReadOnly && <th className="px-4 py-2.5 text-center">—</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100 text-xs">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isReadOnly ? 3 : 4}
                        className="py-10 text-center text-[var(--yuriana-input-placeholder)] italic text-xs"
                      >
                        Sin ingresos registrados
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item._key} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-gray-600">{item.fecha}</td>
                        <td className="px-4 py-2.5 text-[var(--yuriana-base-gray-dark)] font-medium">{item.descripcion}</td>
                        <td className="px-4 py-2.5 text-right font-black text-[var(--yuriana-base-gray-dark)]">
                          {fmt(item.monto)}
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item._key)}
                              className="text-[var(--yuriana-input-error)] hover:scale-110 transition-transform"
                            >
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

        {/* Panel totales */}
        <div className="w-52 shrink-0 bg-[var(--yuriana-card-bg)] rounded-3xl border-2 border-[var(--yuriana-input-border)] shadow-lg p-5 flex flex-col gap-3 sticky top-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--yuriana-base-yellow)]">Total Ingresos</p>
          {totalGeneral > 0 ? (
            <div>
              <p className="text-[10px] text-[var(--yuriana-input-placeholder)] font-semibold uppercase">Total</p>
              <p className="text-2xl font-black text-[var(--yuriana-base-orange)]">
                {fmt(totalGeneral)}{" "}
                <span className="text-xs font-bold text-[var(--yuriana-input-placeholder)]">Bs.</span>
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-[var(--yuriana-input-placeholder)] italic">Sin ingresos aún</p>
          )}
        </div>
      </div>

      {/* Botones */}
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
