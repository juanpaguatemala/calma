'use client';

import type { ReactNode } from 'react';
import { BookOpen, Headphones, Home, LifeBuoy, NotebookPen, Settings, Sprout } from 'lucide-react';
import { Enlace, moduloDe, useNav, type Modulo, type Ruta } from '@/lib/navegacion/rutas';
import { cx } from '@/components/ui';

const MODULOS: Array<{ id: Modulo; ruta: Ruta; label: string; corto: string; Icon: typeof Home }> = [
  { id: 'inicio', ruta: { name: 'inicio' }, label: 'Inicio', corto: 'Inicio', Icon: Home },
  { id: 'programa', ruta: { name: 'programa' }, label: 'Programa de 60 días', corto: 'Programa', Icon: BookOpen },
  { id: 'ejercicios', ruta: { name: 'ejercicios' }, label: 'Ejercicios y reflexiones', corto: 'Ejercicios', Icon: NotebookPen },
  { id: 'podcasts', ruta: { name: 'podcasts' }, label: 'Podcasts', corto: 'Podcasts', Icon: Headphones },
  { id: 'avances', ruta: { name: 'avances' }, label: 'Mis avances', corto: 'Avances', Icon: Sprout },
  { id: 'sos', ruta: { name: 'sos' }, label: 'SOS Calma', corto: 'SOS', Icon: LifeBuoy },
  { id: 'configuracion', ruta: { name: 'configuracion' }, label: 'Configuración y privacidad', corto: 'Ajustes', Icon: Settings },
];

/** En el teléfono, 5 accesos abajo (SOS al centro) y 2 arriba. */
const ABAJO: Modulo[] = ['inicio', 'programa', 'sos', 'ejercicios', 'avances'];
const ARRIBA: Modulo[] = ['podcasts', 'configuracion'];

export function AppShell({ children }: { children: ReactNode }) {
  const { current } = useNav();
  const activo = moduloDe(current);
  const mod = (id: Modulo) => MODULOS.find((m) => m.id === id)!;

  return (
    <div className="min-h-dvh bg-calma-crema font-sans text-calma-tinta md:grid md:grid-cols-[248px_1fr]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2">
        Ir al contenido
      </a>

      {/* Barra lateral (tablet y escritorio) */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-calma-linea bg-white/60 px-4 py-6 md:flex">
        <Marca />
        <nav aria-label="Secciones de CALMA" className="flex flex-col gap-1">
          {MODULOS.map(({ id, ruta, label, Icon }) => (
            <Enlace
              key={id}
              to={ruta}
              aria-current={activo === id ? 'page' : undefined}
              className={cx(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition',
                id === 'sos' && activo !== 'sos' && 'text-[#9a5a43]',
                activo === id ? 'bg-calma-verde text-white' : 'text-calma-verde hover:bg-calma-crema',
              )}
            >
              <Icon aria-hidden className="h-5 w-5 shrink-0" />
              {label}
            </Enlace>
          ))}
        </nav>
        <p className="mt-auto text-xs leading-relaxed text-calma-gris">Educativa y de autoayuda. No sustituye la atención profesional.</p>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Encabezado (teléfono) */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-calma-linea bg-calma-crema/95 px-4 py-3 backdrop-blur md:hidden">
          <Marca />
          <nav aria-label="Más secciones" className="flex gap-1">
            {ARRIBA.map((id) => {
              const { ruta, label, Icon } = mod(id);
              return (
                <Enlace key={id} to={ruta} aria-label={label} aria-current={activo === id ? 'page' : undefined} className={cx('grid h-11 w-11 place-items-center rounded-2xl', activo === id ? 'bg-calma-verde text-white' : 'text-calma-verde hover:bg-white')}>
                  <Icon aria-hidden className="h-5 w-5" />
                </Enlace>
              );
            })}
          </nav>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">
          {children}
        </main>

        {/* Navegación inferior (teléfono) */}
        <nav aria-label="Secciones principales" className="fixed inset-x-0 bottom-0 z-20 border-t border-calma-linea bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
          <ul className="mx-auto grid max-w-md grid-cols-5">
            {ABAJO.map((id) => {
              const { ruta, corto, label, Icon } = mod(id);
              const on = activo === id;
              if (id === 'sos') {
                return (
                  <li key={id} className="flex justify-center">
                    <Enlace to={ruta} aria-label={label} aria-current={on ? 'page' : undefined} className="-mt-5 flex flex-col items-center gap-0.5">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-calma-terracota text-white shadow-md ring-4 ring-white">
                        <Icon aria-hidden className="h-6 w-6" />
                      </span>
                      <span className="text-[11px] font-semibold text-[#9a5a43]">{corto}</span>
                    </Enlace>
                  </li>
                );
              }
              return (
                <li key={id}>
                  <Enlace to={ruta} aria-label={label} aria-current={on ? 'page' : undefined} className={cx('flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium', on ? 'text-calma-verde' : 'text-calma-gris')}>
                    <Icon aria-hidden className={cx('h-5 w-5', on && 'stroke-[2.4]')} />
                    {corto}
                    <span aria-hidden className={cx('h-1 w-1 rounded-full', on ? 'bg-calma-verde' : 'bg-transparent')} />
                  </Enlace>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function Marca() {
  return (
    <Enlace to={{ name: 'inicio' }} className="flex items-center gap-2.5" aria-label="CALMA, ir al inicio">
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-2xl bg-calma-verde">
        <span className="h-3.5 w-3.5 rounded-full bg-calma-salvia ring-[3px] ring-calma-crema/40" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-[0.12em] text-calma-verde">CALMA</span>
        <span className="mt-0.5 hidden text-[11px] text-calma-gris sm:block md:block">Aprender a responder es posible</span>
      </span>
    </Enlace>
  );
}
