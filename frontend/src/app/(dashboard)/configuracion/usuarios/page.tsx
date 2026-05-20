"use client";

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

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea dar de baja a este usuario operario?")) {
      try {
        await deleteUsuario(id);
        loadPageData(); 
      } catch (error) {
        console.error("ERROR EN PROCESO DE ELIMINACIÓN DE OPERARIO:", error);
        alert("No se pudo dar de baja al usuario");
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedUser) {
        await updateUsuario(selectedUser.id_usuario, formData);
      } else {
        await createUsuario(formData);
      }
      setView('list'); // Retorno automático al listado principal
      loadPageData(); 
    } catch (error: any) {
      console.error("ERROR REGISTRADO DESDE EL SERVIDOR DE USUARIOS:", error);
      alert(error.message || "Error al procesar la solicitud. Verifique los datos.");
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
                onDelete={handleDelete}
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
    </div>
  );
}