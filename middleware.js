import { NextResponse } from 'next/server';
import { verificar } from './lib/auth.js';

// Solo el rol admin entra a /admin y a la API de administración
export async function middleware(req) {
  const sesion = await verificar(req.cookies.get('token')?.value);
  if (sesion?.rol === 'admin') return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api')) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/admin/:path*', '/api/((?!auth).*)'] };
