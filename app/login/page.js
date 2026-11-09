'use client';
import { useState } from 'react';

export default function Login() {
  const [error, setError] = useState('');

  async function entrar(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    if (r.ok) window.location.href = '/admin';
    else setError((await r.json()).error);
  }

  return (
    <form className="form login" onSubmit={entrar}>
      <h2>Iniciar sesión</h2>
      {error && <p className="error">{error}</p>}
      <label>Correo<input name="email" type="email" required /></label>
      <label>Contraseña<input name="password" type="password" required /></label>
      <button className="btn pri">Entrar</button>
    </form>
  );
}
