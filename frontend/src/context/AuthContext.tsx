// src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, deleteCookie, getCookie } from 'cookies-next'; // Manejo de cookies para el Proxy
import { User, AuthResponse } from '@/types/auth.types';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Verificamos sesión mediante cookies y localStorage al cargar
    const storedUser = localStorage.getItem('yuriana_user');
    const token = getCookie('yuriana_token'); // Prioridad a la cookie para validación

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      // Si falta alguno, limpiamos para evitar estados inconsistentes
      logout();
    }
    setIsLoading(false);
  }, []);

  const login = async (correo: string, password: string) => {
    try {
      const data: AuthResponse = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      });

      // 2. Guardamos el token en Cookies (Acceso para el Proxy/Middleware)
      // maxAge: 28800 segundos = 8 horas (coincide con tu configuración de NestJS)
      setCookie('yuriana_token', data.access_token, { 
        maxAge: 28800,
        path: '/',
        sameSite: 'lax',
      });

      // 3. Guardamos datos en localStorage para persistencia en el cliente
      localStorage.setItem('yuriana_token', data.access_token);
      localStorage.setItem('yuriana_user', JSON.stringify(data.usuario));

      setUser(data.usuario);
      router.push('/dashboard');
    } catch (error) {
      throw error; // Re-lanzamos el error para que el LoginForm lo muestre
    }
  };

  const logout = () => {
    // 4. Limpiamos absolutamente todo al cerrar sesión
    deleteCookie('yuriana_token', { path: '/' });
    localStorage.removeItem('yuriana_token');
    localStorage.removeItem('yuriana_user');
    
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};