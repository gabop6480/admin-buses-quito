import Link from 'next/link';
import { RECURSOS } from '@/lib/recursos';

export default function AdminLayout({ children }) {
  return (
    <div className="shell">
      <nav className="nav">
        <h1>Buses de Quito</h1>
        {Object.entries(RECURSOS).map(([k, r]) => <Link key={k} href={`/admin/${k}`}>{r.titulo}</Link>)}
        <form action="/api/auth/logout" method="post"><button>Cerrar sesión</button></form>
      </nav>
      <main>{children}</main>
    </div>
  );
}
