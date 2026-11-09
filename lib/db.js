import mongoose from 'mongoose';

const cache = (globalThis._mongo ||= { conn: null, promesa: null });

export async function conectar() {
  if (cache.conn) return cache.conn;
  cache.promesa ||= mongoose.connect(process.env.MONGODB_URI);
  cache.conn = await cache.promesa;
  return cache.conn;
}
