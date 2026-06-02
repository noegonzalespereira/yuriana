
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('yuriana_token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/conductores') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/clientes') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/unidades') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/colaboradores') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/servicios') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/conductores/:path*',
    '/clientes/:path*',
    '/unidades/:path*',
    '/colaboradores/:path*',
    '/servicios/:path*',
    '/login',
  ],
};