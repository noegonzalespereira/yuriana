"use client";
import { useEffect, useState, useCallback } from "react";
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { RequisitoTable } from "@/components/organisms/RequisitoTable";
import { RequisitoForm } from "@/components/organisms/RequisitoForm";
import { 
  getCategorias, 
  getRequisitos, 
  createRequisito, 
  updateRequisito, 
  deleteRequisito 
} from "@/lib/api/requisito.api";
import { toast } from "sonner";
import { RequisitoDocumento, CategoriaEntidad, TipoCategoria } from "@/types/documento.types";
import { Plus } from "lucide-react";

type RaizTab = 'Unidad' | 'Conductor' | 'Viaje';

export default function DocumentosPage() {
  // --- NAVEGACIÓN Y VISTAS ---
  const [view, setView] = useState<'list' | 'form'>('list');
  const [tabPrincipal, setTabPrincipal] = useState<RaizTab>('Unidad');
  const [subTab, setSubTab] = useState<TipoCategoria>(TipoCategoria.TRACTO);

  // --- DATOS DEL BACKEND ---
  const [categorias, setCategorias] = useState<CategoriaEntidad[]>([]);
  const [requisitos, setRequisitos] = useState<RequisitoDocumento[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FORM ACCIONES ---
  const [selectedReq, setSelectedReq] = useState<RequisitoDocumento | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Carga inicial estática de las categorías guardadas en base de datos
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const catList = await getCategorias();
        setCategorias(catList);
      } catch (err) {
        console.error("ERROR CRÍTICO AL OBTENER CATEGORÍAS:", err);
      }
    };
    fetchMasterData();
  }, []);

  // Determinar la categoría ID correspondiente según el árbol seleccionado
  const getCategoriaActivaId = (): number => {
    const encontrada = categorias.find(c => c.tipo_categoria === subTab);
    return encontrada ? encontrada.id_categoria : 1; 
  };

  // Cargar requisitos sincronizados con las pestañas
  const loadRequisitos = useCallback(async () => {
    const idCat = getCategoriaActivaId();
    if (!idCat || categorias.length === 0) return;
    try {
      setLoading(true);
      const data = await getRequisitos({ id_categoria: idCat });
      setRequisitos(data);
    } catch (error) {
      console.error("ERROR DE SERVIDOR AL CARGAR REQUISITOS:", error);
    } finally {
      setLoading(false);
    }
  }, [subTab, categorias]);

  useEffect(() => {
    loadRequisitos();
  }, [loadRequisitos]);

  // Manejar el cambio de nivel principal ('Unidad' | 'Conductor' | 'Viaje')
  const handleRaizTabChange = (target: RaizTab) => {
    setTabPrincipal(target);
    if (target === 'Unidad') setSubTab(TipoCategoria.TRACTO);
    if (target === 'Conductor') setSubTab(TipoCategoria.CONDUCTOR);
    if (target === 'Viaje') setSubTab(TipoCategoria.VIAJE_NACIONAL);
  };

  const handleDelete = async (id: number) => {
    toast.error("¿Eliminar requisito?", {
    description: "Esta acción no se puede deshacer.",
    action: {
      label: "Confirmar",
      onClick: async () => {
        try {
          await deleteRequisito(id);
          toast.success("Requisito eliminado");
          loadRequisitos();
        } catch (err: any) {
          toast.error("Error al eliminar", {
            description: err.message || "No se pudo eliminar el requisito."
          });
        }
      }
    }
  });
};

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedReq) {
        await updateRequisito(selectedReq.id_requisito_documento, formData);
        toast.success("Requisito actualizado");
      } else {
        await createRequisito(formData);
        toast.success("Requisito registrado", {
          description: "El nuevo requisito fue añadido correctamente."
        });
      }
      setView('list');
      loadRequisitos();
    } catch (error: any) {
      console.error("ERROR LANZADO POR EL SERVIDOR (REQUISITOS):", error);
      toast.error("Error al guardar", {
        description: error.message || "El requisito ya existe para esta categoría."
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* HEADER DE MÓDULO */}
      <div className="flex justify-between items-center bg-yuriana-orange text-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Gestión de Requisitos de Documentación</h1>
          <p className="text-xs opacity-90 font-medium">Asigne parámetros y políticas de vencimiento a cada entidad logística</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => { setSelectedReq(null); setIsReadOnly(false); setView('form'); }}
            className="flex items-center gap-2 bg-yuriana-yellow hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm uppercase tracking-tighter"
          >
            <Plus size={18} /> Añadir Requisito
          </button>
        )}
      </div>

      {/* TABS SUPERIORES (NIVEL 1) */}
      <div className="flex bg-white p-2 rounded-2xl border border-border shadow-sm max-w-3xl mx-auto gap-2">
        {(['Unidad', 'Conductor', 'Viaje'] as RaizTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleRaizTabChange(tab)}
            className={`flex-1 py-3 text-center text-sm font-bold uppercase rounded-xl transition-all ${
              tabPrincipal === tab 
                ? 'bg-yuriana-yellow text-black shadow-inner font-black' 
                : 'text-gray-400 hover:text-gray-600 border border-border/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          
          {/* SUB-TABS INTERNAS (NIVEL 2) */}
          {tabPrincipal === 'Unidad' && (
            <div className="flex gap-6 border-b border-border pb-2 px-4 text-xs font-black uppercase tracking-wider text-gray-400">
              {([TipoCategoria.TRACTO, TipoCategoria.SEMIREMOLQUE, TipoCategoria.REMOLQUE]).map((sub) => (
                <button 
                  key={sub} 
                  onClick={() => setSubTab(sub)}
                  className={`pb-2 transition-all ${subTab === sub ? 'border-b-2 border-yuriana-orange text-yuriana-orange font-black' : 'hover:text-gray-600'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {tabPrincipal === 'Viaje' && (
            <div className="flex gap-6 border-b border-border pb-2 px-4 text-xs font-black uppercase tracking-wider text-gray-400">
              {([TipoCategoria.VIAJE_NAClONAL, TipoCategoria.VIAJE_INTERNACIONAL]).map((sub) => (
                <button 
                  key={sub} 
                  onClick={() => setSubTab(sub)}
                  className={`pb-2 transition-all ${subTab === sub ? 'border-b-2 border-yuriana-orange text-yuriana-orange font-black' : 'hover:text-gray-600'}`}
                >
                  {sub.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {/* VISTA DE TABLA PRINCIPAL */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-border">
            <h2 className="font-bold text-gray-700 uppercase tracking-tighter mb-4 text-sm px-2">
              Listado de Requisitos para <span className="text-yuriana-orange">{subTab.replace('_', ' ')}</span>
            </h2>

            {loading ? (
              <div className="py-20 text-center text-gray-400 italic text-sm">Consultando requerimientos activos...</div>
            ) : (
              <RequisitoTable 
                data={requisitos}
                onDelete={handleDelete}
                onEdit={(r) => { setSelectedReq(r); setIsReadOnly(false); setView('form'); }}
                onView={(r) => { setSelectedReq(r); setIsReadOnly(true); setView('form'); }}
              />
            )}
          </div>
        </div>
      ) : (
        /* VISTA DEL FORMULARIO COMPLETO */
        <div className="space-y-4">
          <div className="text-center py-2">
            <h2 className="text-xl font-black text-gray-700 uppercase tracking-tight">
              {selectedReq ? (isReadOnly ? "Detalle del Requisito" : "Modificar Parámetros") : "Registrar nuevo documento"}
            </h2>
            <p className="text-xs text-gray-400">El requisito se asignará a la categoría: <span className="font-bold text-yuriana-orange uppercase">{subTab.replace('_', ' ')}</span></p>
          </div>
          <RequisitoForm 
            initialData={selectedReq}
            idCategoriaActiva={getCategoriaActivaId()}
            onSubmit={handleFormSubmit}
            onCancel={() => setView('list')}
            isReadOnly={isReadOnly}
          />
        </div>
      )}
    </div>
  );
}