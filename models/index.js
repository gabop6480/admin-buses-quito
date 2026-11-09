import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const ref = (a, extra = {}) => ({ type: Schema.Types.ObjectId, ref: a, required: true, ...extra });
const texto = (extra = {}) => ({ type: String, required: true, trim: true, ...extra });

function def(nombre, campos, extra) {
  const s = new Schema(campos, { timestamps: true });
  s.set('toJSON', { transform: (_, o) => { delete o.password; delete o.__v; return o; } });
  extra?.(s);
  return models[nombre] || model(nombre, s);
}

export const Rol = def('Rol', { codigo: texto({ unique: true }), nombre: texto(), descripcion: String });

export const Usuario = def('Usuario', {
  email: texto({ unique: true, lowercase: true }),
  nombre: texto(), apellido: texto(),
  password: { type: String, required: true, select: false },
  rol: ref('Rol'),
});

export const TipoRuta = def('TipoRuta', {
  nombre: texto({ unique: true }),
  permiteOmitirParada: { type: Boolean, default: false },
  maxParadasOmitidas: { type: Number, default: 0, min: 0 },
  umbralOcupacion: { type: Number, default: 90, min: 1, max: 100 },
  velocidadMaxima: { type: Number, default: 50, min: 1 },
});

export const Parada = def('Parada', {
  codigo: texto({ unique: true }), nombre: texto(),
  ubicacion: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } },
}, (s) => s.index({ ubicacion: '2dsphere' }));

// RUTA_PARADA va embebida como arreglo ordenado dentro de la ruta
export const Ruta = def('Ruta', {
  codigo: texto({ unique: true }), nombre: texto(),
  tipoRuta: ref('TipoRuta'),
  paradas: [{ _id: false, parada: ref('Parada'), orden: { type: Number, required: true } }],
});

export const Unidad = def('Unidad', {
  placa: texto({ unique: true, uppercase: true }),
  capacidad: { type: Number, required: true, min: 1 },
  estado: { type: String, enum: ['activa', 'inactiva', 'mantenimiento'], default: 'activa' },
  claveDispositivo: { type: String, trim: true },
  ruta: ref('Ruta'),
});

export const Chofer = def('Chofer', {
  cedula: texto({ unique: true }), nombre: texto(), apellido: texto(),
  tipoLicencia: { type: String, enum: ['C', 'D', 'E'], required: true },
  vigenciaLicencia: { type: Date, required: true },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  usuario: ref('Usuario'),
});

export const Turno = def('Turno', {
  chofer: ref('Chofer'), unidad: ref('Unidad'),
  inicio: { type: Date, required: true }, fin: { type: Date, required: true },
});
