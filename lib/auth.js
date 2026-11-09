import { SignJWT, jwtVerify } from 'jose';

const clave = () => new TextEncoder().encode(process.env.JWT_SECRET);

export const firmar = (payload) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('8h').sign(clave());

export async function verificar(token) {
  try { return (await jwtVerify(token, clave())).payload; } catch { return null; }
}
