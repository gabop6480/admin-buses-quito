import { conectar } from '../lib/db.js';
import { DatoTiempoReal, Unidad, Ruta } from '../models/index.js';

const num = (v) => typeof v === 'number' && Number.isFinite(v);
const entero = (v) => Number.isInteger(v) && v >= 0;

// Recibe una lectura del simulador (o de un GPS real) y la guarda en la serie de tiempo.
// La unidad se identifica con su claveDispositivo, que actúa como credencial del dispositivo.
export async function registrarLectura(body) {
  await conectar();
  const clave = String(body.claveDispositivo || '').trim();
  const unidad = clave && (await Unidad.findOne({ claveDispositivo: clave }));
  if (!unidad) return { estado: 401, error: 'Dispositivo no reconocido.' };
  if (unidad.estado !== 'activa') return { estado: 409, error: 'La unidad no está activa.' };

  const { lat, lng, velocidad, pasajerosABordo, pasajerosEsperando, paradaSolicitada = false, paradaSiguiente } = body;
  if (!num(lat) || lat < -90 || lat > 90 || !num(lng) || lng < -180 || lng > 180) return { estado: 400, error: 'Ubicación fuera de rango.' };
  if (!num(velocidad) || velocidad < 0 || velocidad > 150) return { estado: 400, error: 'Velocidad fuera de rango (0-150 km/h).' };
  if (!entero(pasajerosABordo) || pasajerosABordo > unidad.capacidad) return { estado: 400, error: 'Los pasajeros a bordo exceden la capacidad de la unidad.' };
  if (!entero(pasajerosEsperando)) return { estado: 400, error: 'Pasajeros esperando inválidos.' };
  if (typeof paradaSolicitada !== 'boolean') return { estado: 400, error: 'paradaSolicitada debe ser verdadero o falso.' };

  const ruta = await Ruta.findById(unidad.ruta);
  if (!ruta?.paradas.some((p) => String(p.parada) === String(paradaSiguiente))) return { estado: 400, error: 'La parada siguiente no pertenece a la ruta de la unidad.' };

  const dato = await DatoTiempoReal.create({
    unidad: unidad._id, paradaSiguiente, velocidad, pasajerosABordo, pasajerosEsperando, paradaSolicitada,
    ubicacion: { type: 'Point', coordinates: [lng, lat] },
  });
  return { estado: 201, id: dato._id };
}
