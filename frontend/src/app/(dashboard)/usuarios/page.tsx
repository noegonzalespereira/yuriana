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
import { UserFormModal } from "@/components/organisms/UserFormModal";

export default function UsuariosPage() {
  // --- ESTADOS ---
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [loading, setLoading] = useState(true);

  // Estados para el Modal y Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  // Estado único para filtros (Nombre, Rol, Estado)
  const [filters, setFilters] = useState({ nombre: "", rol: "", estado: "" });

  // --- CARGA DE DATOS ---
  
  /**
   * Función centralizada para obtener datos del backend de NestJS.
   * Se dispara cada vez que los filtros cambian o se realiza una acción (CRUD).
   */
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
      console.error("Error al cargar datos en Usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // --- MANEJADORES DE ACCIONES ---

  // Abrir modal para nuevo registro
  const handleOpenCreate = () => {
    setSelectedUser(null); 
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  // Abrir modal para edición (se busca el objeto usuario por ID)
  const handleOpenEdit = (id: number) => {
    const user = users.find(u => u.id_usuario === id);
    if (user) {
      setSelectedUser(user);
      setIsReadOnly(false);
      setIsModalOpen(true);
    }
  };

  // Acción de eliminar (Borrado Lógico status: false)
  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea dar de baja a este usuario?")) {
      try {
        await deleteUsuario(id);
        await loadPageData(); // Refrescamos lista y contadores
      } catch (error) {
        alert("No se pudo eliminar el usuario");
      }
    }
  };

  // Envío del formulario (Soporta Crear y Actualizar)
  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        // Modo Edición: PATCH /usuario/:id
        await updateUsuario(selectedUser.id_usuario, data);
      } else {
        // Modo Creación: POST /usuario
        await createUsuario(data);
      }
      setIsModalOpen(false);
      loadPageData(); // Recarga para ver cambios
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al procesar la solicitud. Verifique los datos.");
    }
  };

  const handleOpenView = (id: number) => {
    const user = users.find(u => u.id_usuario === id);
    if (user) {
      setSelectedUser(user);
      setIsReadOnly(true); 
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. Header: Título + Buscador + Botón Nuevo */}
      <ModuleHeader 
        title="Gestión de Usuarios" 
        subtitle="Administre los accesos y roles del personal de transporte"
        searchPlaceholder="Buscar por nombre..."
        onSearch={(val) => setFilters({ ...filters, nombre: val })} 
        buttonLabel="Nuevo Usuario"
        onButtonClick={handleOpenCreate}
      />

      {/* 2. Resumen: Total, Activos, Inactivos */}
      <UserStatsCards {...stats} />

      {/* 3. Contenedor de Tabla y Filtros */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 min-h-[400px]">
        
        {/* Barra de Filtros secundarios (Rol y Estado) */}
        <UserFilterBar 
          roles={roles} 
          onRolChange={(val) => setFilters({ ...filters, rol: val })}
          onEstadoChange={(val) => setFilters({ ...filters, estado: val })}
        />
        
        {/* Tabla principal con acciones */}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400 italic">
            Actualizando listado...
          </div>
        ) : (
          <UserTable 
            users={users} 
            onDelete={handleDelete}
            onEdit={handleOpenEdit}
            onView={(id) => console.log("Visualizando detalle de usuario:", id)}
          />
        )}
      </div>

      {/* 4. Modal único para Crear y Editar */}
      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        roles={roles}
        initialData={selectedUser} 
      />
      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        roles={roles}
        initialData={selectedUser}
        isReadOnly={isReadOnly} // <-- Aquí lo conectas
      />
      
    </div>
    
  );
}