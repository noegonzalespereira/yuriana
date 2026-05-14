// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Intentamos obtener el token de las cookies (más seguro que localStorage para el Middleware)
  const token = request.cookies.get('yuriana_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Si intenta entrar al dashboard sin token, al login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Si ya tiene token e intenta ir al login, al dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/unidades/:path*', 
    '/clientes/:path*', 
    '/login'
  ],
};