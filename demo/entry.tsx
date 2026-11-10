import '@fontsource-variable/figtree';
import '@fontsource-variable/outfit';
import { createRoot } from 'react-dom/client';
import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { NavProvider, type Ruta } from '@/lib/navegacion/rutas';
import { AppShell } from '@/features/shell/AppShell';
import { Inicio } from '@/features/inicio/Inicio';
import { Programa } from '@/features/programa/Programa';
import { Leccion } from '@/features/leccion/Leccion';
import { Ejercicios } from '@/features/ejercicios/Ejercicios';
import { Podcasts, PodcastDetalle } from '@/features/podcasts/Podcasts';
import { Avances } from '@/features/avances/Avances';
import { Sos } from '@/features/sos/Sos';
import { Configuracion } from '@/features/configuracion/Configuracion';

// Vista previa: misma app, con rutas en el "#" en lugar del App Router.
const hashFor = (r: Ruta) => (r.name === 'dia' ? `#dia-${r.day}` : r.name === 'podcast' ? `#${r.id}` : `#${r.name}`);
function fromHash(h: string): Ruta {
  const s = h.replace(/^#/, '');
  const d = s.match(/^dia-(\d{1,2})$/);
  if (d) return { name: 'dia', day: Number(d[1]) };
  if (/^podcast-\d{2}$/.test(s)) return { name: 'podcast', id: s };
  const simple = ['programa', 'ejercicios', 'podcasts', 'avances', 'sos', 'configuracion'] as const;
  const hit = simple.find((x) => x === s);
  return hit ? { name: hit } : { name: 'inicio' };
}
function Link({ to, children, ...rest }: { to: Ruta; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return <a href={hashFor(to)} {...rest}>{children}</a>;
}
function Pantalla({ r }: { r: Ruta }) {
  switch (r.name) {
    case 'programa': return <Programa />;
    case 'dia': return <Leccion day={r.day} />;
    case 'ejercicios': return <Ejercicios />;
    case 'podcasts': return <Podcasts />;
    case 'podcast': return <PodcastDetalle id={r.id} />;
    case 'avances': return <Avances />;
    case 'sos': return <Sos />;
    case 'configuracion': return <Configuracion />;
    default: return <Inicio />;
  }
}
function App() {
  const [r, setR] = useState<Ruta>(() => fromHash(location.hash));
  useEffect(() => {
    const on = () => { setR(fromHash(location.hash)); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return (
    <NavProvider value={{ current: r, Link }}>
      <AppShell><Pantalla key={hashFor(r)} r={r} /></AppShell>
    </NavProvider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
