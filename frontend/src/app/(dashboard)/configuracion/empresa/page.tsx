"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { ModuleField } from "@/components/molecules/ModuleField";
import { getEmpresa, createEmpresa, updateEmpresa } from "@/lib/api/empresa.api";
import { Empresa } from "@/types/empresa.types";
import { toast } from "sonner";
import { Building2, ImageIcon, Upload, Loader2 } from "lucide-react";

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: "onChange" });

  const cargarEmpresa = async () => {
    try {
      setLoading(true);
      const data = await getEmpresa();
      setEmpresa(data);
      if (data) {
        reset({
          nombre: data.nombre,
          nit: data.nit,
          telefono: data.telefono,
          direccion: data.direccion,
          num_paut: data.num_paut,
          num_permiso_internacional: data.num_permiso_internacional,
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    } catch {
      toast.error("Error al cargar los datos de la empresa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, value as string);
        }
      });
      if (logoFile) payload.append("logo", logoFile);

      if (empresa) {
        await updateEmpresa(empresa.id_empresa, payload);
      } else {
        await createEmpresa(payload);
      }

      toast.success("Empresa actualizada", {
        description: "Los datos de la empresa se guardaron correctamente.",
      });

      setLogoFile(null);
      await cargarEmpresa();
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (empresa) {
      reset({
        nombre: empresa.nombre,
        nit: empresa.nit,
        telefono: empresa.telefono,
        direccion: empresa.direccion,
        num_paut: empresa.num_paut,
        num_permiso_internacional: empresa.num_permiso_internacional,
      });
      setLogoFile(null);
      setLogoPreview(empresa.logo_url ?? null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <ModuleHeader
        title="Datos de la Empresa"
        subtitle="Configure la información corporativa y el logotipo de la empresa"
      />

      {loading ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-[var(--yuriana-base-orange)] p-16 flex items-center justify-center gap-3 text-gray-400 italic text-sm">
          <Loader2 size={18} className="animate-spin text-[var(--yuriana-base-orange)]" />
          Cargando información de la empresa...
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-[2.5rem] border-2 border-[var(--yuriana-base-orange)] shadow-sm p-8 space-y-8">

            {/* Sección: Información General */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Building2 size={18} className="text-[var(--yuriana-base-orange)]" />
                <h3 className="font-black text-sm uppercase tracking-tight text-[var(--yuriana-base-black)]">
                  Información de la Empresa
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ModuleField
                  label="Nombre de la Empresa"
                  name="nombre"
                  register={register}
                  rules={{ required: "El nombre es obligatorio" }}
                  placeholder="Ej. Yuriana S.R.L."
                  error={errors.nombre}
                />
                <ModuleField
                  label="NIT"
                  name="nit"
                  register={register}
                  rules={{ required: "El NIT es obligatorio" }}
                  placeholder="Ej. 123456789"
                  error={errors.nit}
                />
                <ModuleField
                  label="Teléfono"
                  name="telefono"
                  register={register}
                  rules={{ required: "El teléfono es obligatorio" }}
                  placeholder="Ej. +591 70000000"
                  error={errors.telefono}
                />
                <ModuleField
                  label="Dirección"
                  name="direccion"
                  register={register}
                  rules={{ required: "La dirección es obligatoria" }}
                  placeholder="Ej. Av. Blanco Galindo km 5"
                  error={errors.direccion}
                />
                <ModuleField
                  label="Número de PAUT"
                  name="num_paut"
                  register={register}
                  rules={{ required: "El número de PAUT es obligatorio" }}
                  placeholder="Ej. 72850020"
                  error={errors.num_paut}
                />
                <ModuleField
                  label="Número de Permiso Internacional"
                  name="num_permiso_internacional"
                  register={register}
                  rules={{ required: "El permiso internacional es obligatorio" }}
                  placeholder="Ej. PI-00001"
                  error={errors.num_permiso_internacional}
                />
              </div>
            </div>

            {/* Sección: Logo */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <ImageIcon size={18} className="text-[var(--yuriana-base-orange)]" />
                <h3 className="font-black text-sm uppercase tracking-tight text-[var(--yuriana-base-black)]">
                  Logotipo de la Empresa
                </h3>
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* Vista previa del logo */}
                <div
                  className="w-40 h-40 rounded-full bg-white border-4 border-[var(--yuriana-base-orange)] shadow-md flex items-center justify-center overflow-hidden"
                >
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo empresa"
                      className="w-full h-full object-contain rounded-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <ImageIcon size={40} />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Sin logo</span>
                    </div>
                  )}
                </div>

                {/* Botón de selección de archivo */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[var(--yuriana-base-orange)] rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[var(--yuriana-base-orange)]">
                    <Upload size={14} />
                    {logoFile ? logoFile.name : "Seleccionar imagen"}
                  </div>
                </label>
                <p className="text-[10px] text-slate-400 italic">PNG, JPG o SVG · Máx. 5 MB</p>
              </div>
            </div>

            {/* Botonera */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 bg-[var(--yuriana-btn-cancel-bg)] text-[var(--yuriana-btn-cancel-text)] rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[var(--yuriana-btn-save-bg)] text-[var(--yuriana-btn-save-text)] rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
