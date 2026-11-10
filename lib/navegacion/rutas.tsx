'use client';

import { createContext, useContext, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';

/** Rutas de CALMA. Los 7 módulos y sus detalles. */
export type Ruta =
  | { name: 'inicio' }
  | { name: 'programa' }
  | { name: 'dia'; day: number }
  | { name: 'ejercicios' }
  | { name: 'podcasts' }
  | { name: 'podcast'; id: string }
  | { name: 'avances' }
  | { name: 'sos' }
  | { name: 'configuracion' };

export type Modulo = 'inicio' | 'programa' | 'ejercicios' | 'podcasts' | 'avances' | 'sos' | 'configuracion';

export function pathFor(r: Ruta): string {
  switch (r.name) {
    case 'inicio':
      return '/';
    case 'dia':
      return `/programa/${r.day}`;
    case 'podcast':
      return `/podcasts/${r.id}`;
    default:
      return `/${r.name}`;
  }
}

/** Módulo al que pertenece una ruta (para marcar la navegación activa). */
export function moduloDe(r: Ruta): Modulo {
  if (r.name === 'dia') return 'programa';
  if (r.name === 'podcast') return 'podcasts';
  return r.name;
}

export function rutaFromPath(path: string): Ruta {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/') return { name: 'inicio' };
  const dia = p.match(/^\/programa\/(\d{1,2})$/);
  if (dia) return { name: 'dia', day: Number(dia[1]) };
  const pod = p.match(/^\/podcasts\/(podcast-\d{2})$/);
  if (pod?.[1]) return { name: 'podcast', id: pod[1] };
  const simple = ['programa', 'ejercicios', 'podcasts', 'avances', 'sos', 'configuracion'] as const;
  const hit = simple.find((s) => p === `/${s}`);
  return hit ? { name: hit } : { name: 'inicio' };
}

type LinkProps = { to: Ruta; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

interface NavValue {
  current: Ruta;
  Link: ComponentType<LinkProps>;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ value, children }: { value: NavValue; children: ReactNode }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const v = useContext(NavContext);
  if (!v) throw new Error('useNav fuera de NavProvider');
  return v;
}

/** Enlace interno independiente del enrutador (Next.js, demo o Capacitor). */
export function Enlace(props: LinkProps) {
  const { Link } = useNav();
  return <Link {...props} />;
}
