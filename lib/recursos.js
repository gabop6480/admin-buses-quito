// Configuración de las pantallas de administración (la usa la vista; el servidor tiene la suya en controllers/crud.js)
export const etiqueta = (o) => (o ? [o.codigo, o.placa, o.nombre, o.apellido].filter(Boolean).join(' ') : '');
const fecha = (v) => (v ? String(v).slice(0, 10) : '');

export const RECURSOS = {
  tiposRuta: { titulo: 'Tipos de ruta', campos: [
    { n: 'nombre', t: 'texto', l: 'Nombre' },
    { n: 'permiteOmitirParada', t: 'bool', l: 'Permite omitir paradas', ver: (r) => (r.permiteOmitirParada ? 'Sí' : 'No') },
    { n: 'maxParadasOmitidas', t: 'numero', l: 'Máx. paradas omitidas seguidas' },
    { n: 'umbralOcupacion', t: 'numero', l: 'Umbral de ocupación (%)' },
    { n: 'velocidadMaxima', t: 'numero', l: 'Velocidad máxima (km/h)' },
  ] },
  paradas: { titulo: 'Paradas', campos: [
    { n: 'codigo', t: 'texto', l: 'Código' },
    { n: 'nombre', t: 'texto', l: 'Nombre' },
    { n: 'lat', t: 'numero', l: 'Latitud', paso: 'any', get: (r) => r.ubicacion?.coordinates[1], ver: (r) => r.ubicacion?.coordinates[1] },
    { n: 'lng', t: 'numero', l: 'Longitud', paso: 'any', get: (r) => r.ubicacion?.coordinates[0], ver: (r) => r.ubicacion?.coordinates[0] },
  ] },
  rutas: { titulo: 'Rutas', campos: [
    { n: 'codigo', t: 'texto', l: 'Código' },
    { n: 'nombre', t: 'texto', l: 'Nombre' },
    { n: 'tipoRuta', t: 'ref', ref: 'tiposRuta', l: 'Tipo de ruta' },
    { n: 'paradas', t: 'paradas', l: 'Paradas (en orden)', ver: (r) => r.paradas.length + ' paradas',
      get: (r) => [...(r.paradas || [])].sort((a, b) => a.orden - b.orden).map((p) => p.parada._id) },
  ] },
  unidades: { titulo: 'Unidades', campos: [
    { n: 'placa', t: 'texto', l: 'Placa (ABC-1234)' },
    { n: 'capacidad', t: 'numero', l: 'Capacidad (pasajeros)' },
    { n: 'estado', t: 'select', l: 'Estado', opciones: ['activa', 'inactiva', 'mantenimiento'] },
    { n: 'claveDispositivo', t: 'texto', l: 'Clave del dispositivo GPS', opcional: true },
    { n: 'ruta', t: 'ref', ref: 'rutas', l: 'Ruta' },
  ] },
  usuarios: { titulo: 'Usuarios', campos: [
    { n: 'nombre', t: 'texto', l: 'Nombre' },
    { n: 'apellido', t: 'texto', l: 'Apellido' },
    { n: 'email', t: 'email', l: 'Correo' },
    { n: 'password', t: 'password', l: 'Contraseña', soloForm: true, ayuda: 'Al editar, déjala vacía para conservar la actual.' },
    { n: 'rol', t: 'ref', ref: 'roles', l: 'Rol' },
  ] },
  choferes: { titulo: 'Choferes', campos: [
    { n: 'cedula', t: 'texto', l: 'Cédula' },
    { n: 'nombre', t: 'texto', l: 'Nombre' },
    { n: 'apellido', t: 'texto', l: 'Apellido' },
    { n: 'tipoLicencia', t: 'select', l: 'Tipo de licencia', opciones: ['C', 'D', 'E'] },
    { n: 'vigenciaLicencia', t: 'fecha', l: 'Vigencia de la licencia', get: (r) => fecha(r.vigenciaLicencia), ver: (r) => fecha(r.vigenciaLicencia) },
    { n: 'estado', t: 'select', l: 'Estado', opciones: ['activo', 'inactivo'] },
    { n: 'usuario', t: 'ref', ref: 'usuarios', l: 'Usuario de acceso', ver: (r) => r.usuario?.email },
  ] },
  turnos: { titulo: 'Turnos', campos: [
    // Dropdowns dependientes: ruta -> unidades de esa ruta
    { n: 'ruta', t: 'ref', ref: 'rutas', l: 'Ruta', virtual: true, get: (r) => r.unidad?.ruta?._id, ver: (r) => etiqueta(r.unidad?.ruta) },
    { n: 'unidad', t: 'ref', ref: 'unidades', l: 'Unidad', dependeDe: 'ruta', filtro: 'ruta' },
    { n: 'chofer', t: 'ref', ref: 'choferes', l: 'Chofer' },
    { n: 'inicio', t: 'datetime', l: 'Inicio', ver: (r) => new Date(r.inicio).toLocaleString() },
    { n: 'fin', t: 'datetime', l: 'Fin', ver: (r) => new Date(r.fin).toLocaleString() },
  ] },
};
