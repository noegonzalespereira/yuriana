"use client";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { User, Rol } from "@/types/auth.types";

// API Services
import { 
  getUsuarios, 
  getUsuariosContador, 
  deleteUsuario, 
  createUsuario, 
  updateUsuario 
} from "@/lib/api/usuarios.api";
import { getRoles } from "@/lib/api/roles.api";

// Componentes (Atomic Design)
import { ModuleHeader } from "@/components/organisms/ModuleHeader";
import { UserStatsCards } from "@/components/organisms/UserStatsCards";
import { UserTable } from "@/components/organisms/UserTable";
import { UserFilterBar } from "@/components/molecules/UserFilterBar";
import { UserForm } from "@/components/organisms/UserForm";

export default function UsuariosPage() {
  // --- NAVEGACIÓN Y COMPORTAMIENTO ---
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null);
  // --- ESTADOS DE DATOS ---
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });

  // Estados de control de operaciones del Formulario Integral
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [filters, setFilters] = useState({ nombre: "", rol: "", estado: "" });

  // --- CARGA DE DATOS CENTRALIZADA ---
  const loadPageData = useCallback(async () => {
    try {
      setLoading(true);
      const [userData, statsData, rolesData] = await Promise.all([
        getUsuarios(filters),
        getUsuariosContador(),
        getRoles()
      ]);
      setUsers(userData);
      setStats(statsData);
      setRoles(rolesData);
    } catch (error) {
      console.error("ERROR CRÍTICO AL CARGAR FLUJO DE USUARIOS:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // --- MANEJADORES DE OPERACIONES ---

  const handleOpenCreate = () => {
    setSelectedUser(null); 
    setIsReadOnly(false);
    setView('form'); // Despliegue en pantalla completa
  };

  const handleOpenEdit = (id: number) => {
    const user = users.find(u => u.id_usuario === id);
    if (user) {
      setSelectedUser(user);
      setIsReadOnly(false);
      setView('form');
    }
  };

  const handleOpenView = (id: number) => {
    const user = users.find(u => u.id_usuario === id);
    if (user) {
      setSelectedUser(user);
      setIsReadOnly(true); 
      setView('form');
    }
  };

  const handleOpenDeleteConfirmation = (id: number) => {
  setIdParaEliminar(id);
  setShowDeleteModal(true);
};

const handleConfirmDelete = async () => {
  if (!idParaEliminar) return;
  try {
    await deleteUsuario(idParaEliminar);
    toast.success("Usuario desactivado", {
      description: "El operario fue dado de baja del sistema."
    });
    loadPageData();
  } catch (error: any) {
    toast.error("Error al eliminar", {
      description: error.message || "No se pudo dar de baja al usuario."
    });
  } finally {
    setShowDeleteModal(false);
    setIdParaEliminar(null);
  }
};

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedUser) {
        await updateUsuario(selectedUser.id_usuario, formData);
        toast.success("Usuario actualizado", {
          description: "Los datos del operario fueron actualizados."
        });
      } else {
        await createUsuario(formData);
        toast.success("Usuario registrado", {
          description: "El nuevo operario fue registrado con éxito."
        });
      }
      setView('list'); // Retorno automático al listado principal
      loadPageData(); 
    } catch (error: any) {
      console.error("ERROR REGISTRADO DESDE EL SERVIDOR DE USUARIOS:", error);
      toast.error("Error al guardar", {
        description: error.message || "Verifique los datos e intente de nuevo."
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Dinámico Unificado */}
      <ModuleHeader 
        title={view === 'list' ? "Gestión de Usuarios" : selectedUser ? (isReadOnly ? "Datos del Operario" : "Modificar Operario") : "Registrar Nuevo Usuario"} 
        subtitle={view === 'form' ? "Configure los permisos y accesos de seguridad del personal corporativo" : "Administre los accesos y roles del personal de transporte"}
        searchPlaceholder="Buscar por nombre..."
        onSearch={view === 'list' ? (val) => setFilters({ ...filters, nombre: val }) : undefined} 
        buttonLabel={view === 'list' ? "Nuevo Usuario" : undefined}
        onButtonClick={handleOpenCreate}
      />

      {view === 'list' ? (
        /* VISTA DE TABLA Y CONTROL DE LISTADOS */
        <div className="space-y-6">
          {/* Tarjetas de Estadísticas Avanzadas */}
          <UserStatsCards {...stats} />

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-border min-h-[400px]">
            {/* Filtros Secundarios de Selección */}
            <UserFilterBar 
              roles={roles} 
              onRolChange={(val) => setFilters({ ...filters, rol: val })}
              onEstadoChange={(val) => setFilters({ ...filters, estado: val })}
            />
            
            {loading ? (
              <div className="flex justify-center items-center h-64 text-gray-400 italic text-sm font-medium">
                Actualizando listado de seguridad...
              </div>
            ) : (
              <UserTable 
                users={users} 
                onDelete={handleOpenDeleteConfirmation}
                onEdit={handleOpenEdit}
                onView={handleOpenView}
              />
            )}
          </div>
        </div>
      ) : (
        /* VISTA DE FORMULARIO INTEGRAL EN PANTALLA COMPLETA */
        <UserForm 
          roles={roles}
          initialData={selectedUser}
          isReadOnly={isReadOnly}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('list')}
        />
      )}
      
      {showDeleteModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white p-6 rounded-3xl border border-border shadow-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 bg-red-50 text-[var(--yuriana-input-error)] rounded-full flex items-center justify-center mx-auto border border-red-100">
            <XCircle size={24} />
          </div>
          <div>
            <h3 className="font-black text-gray-800 uppercase tracking-tighter text-base">¿Dar de Baja al Operario?</h3>
            <p className="text-xs text-gray-500 mt-1">El usuario perderá acceso al sistema inmediatamente.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowDeleteModal(false); setIdParaEliminar(null); }}
              className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="button" onClick={handleConfirmDelete}
              className="w-full py-2.5 bg-[var(--yuriana-input-error)] text-white rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-colors shadow-md">
              Dar de Baja
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}