import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { conectar } from '@/lib/db';
import { firmar } from '@/lib/auth';
import { Usuario } from '@/models/index.js';

export async function POST(req) {
  await conectar();
  const { email, password } = await req.json();
  const u = await Usuario.findOne({ email: String(email || '').toLowerCase() }).select('+password').populate('rol');
  if (!u || !(await bcrypt.compare(String(password || ''), u.password))) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('token', await firmar({ id: String(u._id), rol: u.rol.codigo }), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 8 * 3600, secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
