import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { conectar } from '../lib/db.js';
import { cedulaValida, placaValida, passwordValida } from '../lib/validators.js';
import { Rol, Usuario, TipoRuta, Parada, Ruta, Unidad, Chofer, Turno } from '../models/index.js';

const entre = (v, a, b) => v !== '' && v != null && !isNaN(v) && +v >= a && +v <= b;

// Cada recurso: modelo, populate, filtros permitidos en GET, refs (FK a verificar),
// usado (dependencias que impiden borrar) y preparar() = validaciones del back-end.
export const RECURSOS = {
  roles: { modelo: Rol },

  usuarios: {
    modelo: Usuario, populate: 'rol', refs: { rol: Rol }, usado: [[Chofer, 'usuario']],
    async preparar(b, id) {
      if (!/^\S+@\S+\.\S+$/.test(b.email || '')) return 'El correo no es válido.';
      if (id && !b.password) delete b.password;
      else {
        if (!passwordValida(b.password)) return 'La contraseña debe tener mínimo 8 caracteres, con letras y números.';
        b.password = await bcrypt.hash(b.password, 10);
      }
    },
  },

  tiposRuta: {
    modelo: TipoRuta, usado: [[Ruta, 'tipoRuta']],
    preparar(b) {
      if (!entre(b.umbralOcupacion, 1, 100)) return 'El umbral de ocupación debe estar entre 1 y 100.';
      if (!Number.isInteger(+b.maxParadasOmitidas) || +b.maxParadasOmitidas < 0) return 'El máximo de paradas omitidas debe ser un entero mayor o igual a 0.';
      if (!b.permiteOmitirParada) b.maxParadasOmitidas = 0;
    },
  },

  paradas: {
    modelo: Parada, usado: [],
    preparar(b) {
      if (!entre(b.lat, -90, 90) || !entre(b.lng, -180, 180)) return 'Latitud o longitud fuera de rango.';
      b.ubicacion = { type: 'Point', coordinates: [+b.lng, +b.lat] };
    },
  },

  rutas: {
    modelo: Ruta, populate: ['tipoRuta', 'paradas.parada'], refs: { tipoRuta: TipoRuta }, usado: [[Unidad, 'ruta']],
    async preparar(b) {
      const ids = (b.paradas || []).filter(Boolean);
      if (ids.length < 2) return 'Una ruta necesita al menos 2 paradas.';
      if (new Set(ids).size !== ids.length) return 'Una parada no puede repetirse en la misma ruta.';
      if ((await Parada.countDocuments({ _id: { $in: ids } })) !== ids.length) return 'Alguna parada no existe.';
      b.paradas = ids.map((parada, i) => ({ parada, orden: i + 1 }));
    },
  },

  unidades: {
    modelo: Unidad, populate: 'ruta', filtros: ['ruta'], refs: { ruta: Ruta }, usado: [[Turno, 'unidad']],
    preparar(b) {
      b.placa = (b.placa || '').toUpperCase().trim();
      if (!placaValida(b.placa)) return 'La placa debe tener el formato ABC-1234.';
      if (!Number.isInteger(+b.capacidad) || +b.capacidad < 1 || +b.capacidad > 200) return 'La capacidad debe ser un entero entre 1 y 200.';
    },
  },

  choferes: {
    modelo: Chofer, populate: 'usuario', refs: { usuario: Usuario }, usado: [[Turno, 'chofer']],
    preparar(b) {
      // DATO SENSIBLE: la cédula se valida aquí, antes de grabar, aunque el formulario también la revise
      if (!cedulaValida(b.cedula)) return 'La cédula no es válida.';
      if (isNaN(new Date(b.vigenciaLicencia))) return 'La vigencia de la licencia no es válida.';
    },
  },

  turnos: {
    modelo: Turno, populate: ['chofer', { path: 'unidad', populate: 'ruta' }], refs: { chofer: Chofer, unidad: Unidad },
    async preparar(b, id) {
      const inicio = new Date(b.inicio), fin = new Date(b.fin);
      if (isNaN(inicio) || isNaN(fin) || fin <= inicio) return 'El fin del turno debe ser posterior al inicio.';
      const chofer = await Chofer.findById(b.chofer);
      if (chofer && chofer.vigenciaLicencia < fin) return 'La licencia del chofer vence antes de que termine el turno.';
      const choque = await Turno.exists({
        _id: { $ne: id }, inicio: { $lt: fin }, fin: { $gt: inicio },
        $or: [{ chofer: b.chofer }, { unidad: b.unidad }],
      });
      if (choque) return 'El chofer o la unidad ya tienen un turno en ese horario.';
    },
  },
};

const json = (d, s = 200) => NextResponse.json(d, { status: s });
const editable = (cfg) => cfg && cfg.preparar !== undefined || cfg?.refs !== undefined;

function errorMongo(e) {
  if (e.code === 11000) return json({ error: `Ya existe un registro con ese ${Object.keys(e.keyPattern || {})[0] || 'valor'}.` }, 409);
  if (e.name === 'ValidationError' || e.name === 'CastError') return json({ error: e.message }, 400);
  console.error(e);
  return json({ error: 'Error interno del servidor.' }, 500);
}

export async function listar(recurso, req) {
  const cfg = RECURSOS[recurso];
  if (!cfg) return json({ error: 'Recurso no existe.' }, 404);
  try {
    await conectar();
    const filtro = {};
    for (const k of cfg.filtros || []) { const v = req.nextUrl.searchParams.get(k); if (v) filtro[k] = v; }
    let q = cfg.modelo.find(filtro).sort({ createdAt: -1 });
    if (cfg.populate) q = q.populate(cfg.populate);
    return json(await q);
  } catch (e) { return errorMongo(e); }
}

export async function guardar(recurso, req, id) {
  const cfg = RECURSOS[recurso];
  if (!editable(cfg)) return json({ error: 'Recurso no editable.' }, 404);
  try {
    await conectar();
    const body = await req.json();
    for (const [campo, Modelo] of Object.entries(cfg.refs || {})) {
      if (!(await Modelo.exists({ _id: body[campo] }))) return json({ error: `El valor de "${campo}" no existe.` }, 400);
    }
    const error = cfg.preparar && (await cfg.preparar(body, id));
    if (error) return json({ error }, 400);
    const doc = id
      ? await cfg.modelo.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      : await cfg.modelo.create(body);
    return doc ? json(doc, id ? 200 : 201) : json({ error: 'No encontrado.' }, 404);
  } catch (e) { return errorMongo(e); }
}

export async function eliminar(recurso, id) {
  const cfg = RECURSOS[recurso];
  if (!editable(cfg)) return json({ error: 'Recurso no editable.' }, 404);
  try {
    await conectar();
    for (const [Modelo, campo] of cfg.usado || []) {
      if (await Modelo.exists({ [campo]: id })) return json({ error: 'No se puede eliminar: tiene registros asociados.' }, 409);
    }
    return (await cfg.modelo.findByIdAndDelete(id)) ? json({ ok: true }) : json({ error: 'No encontrado.' }, 404);
  } catch (e) { return errorMongo(e); }
}
