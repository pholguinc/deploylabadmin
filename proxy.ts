import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Si intenta acceder a rutas de admin (o hijas) sin token
  if (pathname.startsWith('/admin') && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si intenta acceder al login teniendo ya un token válido
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Si intenta acceder a la raíz, redirigir a admin o login dependiendo si hay token
  if (pathname === '/') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Configurar las rutas en las que queremos que se ejecute el middleware
  matcher: ['/', '/admin/:path*', '/login'],
};
