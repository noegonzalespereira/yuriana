export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: User;
}

export interface LoginDto {
  correo: string;
  password: string;
}