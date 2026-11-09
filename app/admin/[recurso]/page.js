'use client';
import { useEffect, useState, useCallback } from 'react';
import { RECURSOS, etiqueta } from '@/lib/recursos';

const api = async (url, opts) => {
  const r = await fetch(url, opts);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Error inesperado.');
  return d;
};
const enviar = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const aLocal = (v) => (v ? new Date(new Date(v) - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

function valorInicial(c, fila) {
  if (!fila) return c.t === 'paradas' ? [] : c.t === 'bool' ? false : '';
  const v = c.get ? c.get(fila) : fila[c.n];
  if (c.t === 'ref') return v?._id ?? v ?? '';
  if (c.t === 'datetime') return aLocal(v);
  if (c.t === 'password') return '';
  return v ?? '';
}

// Dropdown que carga sus opciones de la API; si depende de otro campo, solo carga cuando ese tiene valor
function Ref({ c, valor, padre, onChange }) {
  const [ops, setOps] = useState([]);
  const bloqueado = c.dependeDe && !padre;
  useEffect(() => {
    if (bloqueado) return setOps([]);
    api(`/api/${c.ref}${c.dependeDe ? `?${c.filtro}=${padre}` : ''}`).then(setOps).catch(() => setOps([]));
  }, [c.ref, c.dependeDe, c.filtro, padre, bloqueado]);
  return (
    <select value={valor} onChange={(e) => onChange(e.target.value)} disabled={bloqueado} required>
      <option value="">{bloqueado ? `Primero elige ${c.dependeDe}` : 'Selecciona…'}</option>
      {ops.map((o) => <option key={o._id} value={o._id}>{etiqueta(o)}</option>)}
    </select>
  );
}

function Paradas({ valor, onChange }) {
  const [ops, setOps] = useState([]);
  useEffect(() => { api('/api/paradas').then(setOps).catch(() => {}); }, []);
  return (
    <div>
      {valor.map((p, i) => (
        <div className="fila" key={i}>
          <span>{i + 1}.</span>
          <select value={p} required onChange={(e) => onChange(valor.map((x, j) => (j === i ? e.target.value : x)))}>
            <option value="">Selecciona…</option>
            {ops.map((o) => <option key={o._id} value={o._id}>{etiqueta(o)}</option>)}
          </select>
          <button type="button" className="btn" aria-label="Quitar parada" onClick={() => onChange(valor.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => onChange([...valor, ''])}>Agregar parada</button>
    </div>
  );
}

export default function Pagina({ params }) {
  const cfg = RECURSOS[params.recurso];
  const [filas, setFilas] = useState([]);
  const [form, setForm] = useState(null);
  const [id, setId] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => api(`/api/${params.recurso}`).then(setFilas).catch((e) => setError(e.message)), [params.recurso]);
  useEffect(() => { setForm(null); setError(''); cargar(); }, [cargar]);
  if (!cfg) return <p>Pantalla no encontrada.</p>;

  const abrir = (fila) => {
    setId(fila?._id ?? null); setError('');
    setForm(Object.fromEntries(cfg.campos.map((c) => [c.n, valorInicial(c, fila)])));
  };
  // al cambiar un campo, se vacían los dropdowns que dependen de él
  const poner = (n, v) => setForm((f) => {
    const nuevo = { ...f, [n]: v };
    cfg.campos.filter((c) => c.dependeDe === n).forEach((c) => (nuevo[c.n] = ''));
    return nuevo;
  });

  async function guardar(e) {
    e.preventDefault(); setError('');
    const body = {};
    for (const c of cfg.campos) {
      if (c.virtual) continue;
      body[c.n] = c.t === 'datetime' && form[c.n] ? new Date(form[c.n]).toISOString() : form[c.n];
    }
    try {
      await api(id ? `/api/${params.recurso}/${id}` : `/api/${params.recurso}`, enviar(id ? 'PUT' : 'POST', body));
      setForm(null); cargar();
    } catch (err) { setError(err.message); }
  }

  async function borrar(fila) {
    if (!confirm('¿Eliminar este registro?')) return;
    try { await api(`/api/${params.recurso}/${fila._id}`, { method: 'DELETE' }); cargar(); }
    catch (err) { setError(err.message); }
  }

  const cols = cfg.campos.filter((c) => !c.soloForm);
  const celda = (c, r) => (c.ver ? c.ver(r) : c.t === 'ref' ? etiqueta(r[c.n]) : String(r[c.n] ?? ''));

  return (
    <>
      <h2>{cfg.titulo}</h2>
      {error && <p className="error">{error}</p>}
      {form ? (
        <form className="form" onSubmit={guardar}>
          {cfg.campos.map((c) => (
            <label key={c.n}>
              {c.l}
              {c.t === 'ref' && <Ref c={c} valor={form[c.n]} padre={form[c.dependeDe]} onChange={(v) => poner(c.n, v)} />}
              {c.t === 'paradas' && <Paradas valor={form[c.n]} onChange={(v) => poner(c.n, v)} />}
              {c.t === 'select' && (
                <select value={form[c.n]} required onChange={(e) => poner(c.n, e.target.value)}>
                  <option value="">Selecciona…</option>
                  {c.opciones.map((o) => <option key={o}>{o}</option>)}
                </select>
              )}
              {c.t === 'bool' && <input type="checkbox" checked={form[c.n]} onChange={(e) => poner(c.n, e.target.checked)} />}
              {['texto', 'email', 'password', 'numero', 'fecha', 'datetime'].includes(c.t) && (
                <input
                  value={form[c.n]} onChange={(e) => poner(c.n, e.target.value)}
                  type={{ texto: 'text', numero: 'number', fecha: 'date', datetime: 'datetime-local' }[c.t] || c.t}
                  step={c.paso} required={!c.opcional && !(c.t === 'password' && id)}
                />
              )}
              {c.ayuda && <small>{c.ayuda}</small>}
            </label>
          ))}
          <div className="fila">
            <button className="btn pri">Guardar cambios</button>
            <button type="button" className="btn" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <p><button className="btn pri" onClick={() => abrir(null)}>Crear nuevo</button></p>
      )}
      {filas.length === 0 ? (
        <div className="vacio">Todavía no hay registros. Crea el primero con «Crear nuevo».</div>
      ) : (
        <table>
          <thead><tr>{cols.map((c) => <th key={c.n}>{c.l}</th>)}<th /></tr></thead>
          <tbody>
            {filas.map((r) => (
              <tr key={r._id}>
                {cols.map((c) => <td key={c.n}>{celda(c, r)}</td>)}
                <td className="acc">
                  <button className="btn" onClick={() => abrir(r)}>Editar</button>{' '}
                  <button className="btn pel" onClick={() => borrar(r)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
