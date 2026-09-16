import { useAuth } from "@/context/AuthContext";

/**
 * Centraliza qué puede hacer cada rol en la UI.
 * ADMIN: acceso total.
 * CONTADOR: solo visualiza la mayoría de los módulos; CRUD completo en
 * Ingresos Extra y Gastos; en Facturación puede editar/eliminar pero no crear
 * (las facturas solo se crean desde Servicio); en Configuración solo ve/edita
 * su propio usuario, sin acceso a Documentos ni Empresa.
 */
export const usePermisos = () => {
  const { user } = useAuth();
  const rol = user?.rol;
  const isAdmin = rol === "ADMIN";
  const isContador = rol === "CONTADOR";

  return {
    isAdmin,
    isContador,
    // unidades, clientes, conductores, colaboradores, asignaciones, servicios
    puedeGestionar: isAdmin,
    // ingreso-extra y gasto
    puedeGestionarFinanzas: isAdmin || isContador,
    // facturación
    puedeEditarFactura: isAdmin || isContador,
    puedeEliminarFactura: isAdmin || isContador,
    // configuración
    puedeVerDocumentosConfig: isAdmin,
    puedeVerEmpresaConfig: isAdmin,
  };
};
