
export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export interface Rol {
  id_rol: number;
  nombre: string;
}

export interface User {
  id_usuario: number;
  nombre: string;
  correo: string;
  id_rol: number;
  estado: EstadoUsuario;
  rol: Rol; // Relations: ['rol'] en tu service
}

// Usuario de sesión (lo que retorna el login)
export interface SessionUser {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: SessionUser;
}
export interface LoginDto {
  correo: string;
  password: string;
}