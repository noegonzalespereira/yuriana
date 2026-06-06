// src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { SessionUser, AuthResponse } from '@/types/auth.types';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: SessionUser | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SessionExpiredModal = ({ onConfirm }: { onConfirm: () => void }) => (
  <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[9999] animate-in fade-in duration-300">
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-sm w-full mx-4 text-center p-8 space-y-6 animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-inner">
        <Lock size={36} className="text-[var(--yuriana-base-orange)]" />
      </div>
      <div className="space-y-2">
        <h2 className="font-black text-xl text-slate-800 uppercase tracking-tight">
          Sesión expirada
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto">
          Tu sesión ha caducado por inactividad. Por seguridad, inicia sesión
          nuevamente para continuar.
        </p>
      </div>
      <button
        onClick={onConfirm}
        className="w-full py-3.5 bg-[var(--yuriana-base-orange)] hover:opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
      >
        Volver al inicio de sesión
      </button>
    </div>
  </div>
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('yuriana_user');
    const token = getCookie('yuriana_token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      logout();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => setSessionExpired(true);
    window.addEventListener('yuriana:session-expired', handleSessionExpired as EventListener);
    return () => window.removeEventListener('yuriana:session-expired', handleSessionExpired as EventListener);
  }, []);

  const login = async (correo: string, password: string) => {
    try {
      const data: AuthResponse = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      });

      setCookie('yuriana_token', data.access_token, {
        maxAge: 28800,
        path: '/',
        sameSite: 'lax',
      });

      localStorage.setItem('yuriana_token', data.access_token);
      localStorage.setItem('yuriana_user', JSON.stringify(data.usuario));

      setUser(data.usuario);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    deleteCookie('yuriana_token', { path: '/' });
    localStorage.removeItem('yuriana_token');
    localStorage.removeItem('yuriana_user');
    setUser(null);
    setSessionExpired(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
      {sessionExpired && <SessionExpiredModal onConfirm={logout} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
