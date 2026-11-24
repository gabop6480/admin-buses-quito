import { NextResponse } from 'next/server';
import { registrarLectura } from '@/controllers/lecturas';

// Endpoint público de ingesta: lo protege la claveDispositivo de cada unidad (ver middleware.js)
export async function POST(req) {
  try {
    const { estado, ...resto } = await registrarLectura(await req.json());
    return NextResponse.json(resto, { status: estado });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
