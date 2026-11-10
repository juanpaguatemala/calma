'use client';

import { Check, Headphones } from 'lucide-react';
import type { DayRecord } from '@/types/programa';
import { getCatalog, getDayView } from '@/lib/programa/engine';
import { TOTAL_DAYS, UNIDADES } from '@/content/programa/unidades';
import { podcastIdForDay } from '@/content/podcasts/episodios';
import { Enlace } from '@/lib/navegacion/rutas';
import { useAllRecords } from '@/features/datos/hooks';
import { Aviso, Barra, Cargando, TituloPagina, cx } from '@/components/ui';

export function Programa() {
  const { days, error } = useAllRecords();
  if (!days) return <Cargando />;
  const byDay = new Map<number, DayRecord>(days.map((d) => [d.day, d]));
  const catalog = getCatalog();
  const completados = days.filter((d) => d.state === 'completado').length;

  return (
    <div className="flex flex-col gap-6">
      <TituloPagina eyebrow="Programa" title="60 días para aprender a responder" intro="Seis unidades de diez días. Avanzá a tu ritmo: podés saltar, repetir y volver a cualquier día." />
      {error && <Aviso tone="error">{error}</Aviso>}
      <div className="flex flex-col gap-1.5">
        <Barra value={completados} max={TOTAL_DAYS} label="Días completados del programa" />
        <p className="text-xs text-calma-gris tabular-nums">
          {completados} de {TOTAL_DAYS} días completados
        </p>
      </div>

      <Leyenda />

      {UNIDADES.map((u) => {
        const dias = Array.from({ length: u.lastDay - u.firstDay + 1 }, (_, i) => u.firstDay + i);
        const hechos = dias.filter((d) => byDay.get(d)?.state === 'completado').length;
        return (
          <section key={u.id} aria-labelledby={`unidad-${u.id}`} className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-calma-gris tabular-nums">
                  Unidad {u.id} · Días {u.firstDay}–{u.lastDay}
                </p>
                <h2 id={`unidad-${u.id}`} className="font-display text-xl font-semibold text-calma-verde">
                  {u.title}
                </h2>
              </div>
              <span className="shrink-0 text-xs text-calma-gris tabular-nums">
                {hechos}/{dias.length}
              </span>
            </div>
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {dias.map((d) => {
                const rec = byDay.get(d);
                const disponible = catalog.lessons.has(d);
                const view = getDayView(d, catalog);
                const titulo = view.kind === 'disponible' ? view.lesson.title : 'Contenido en preparación';
                const estado = rec?.state === 'completado' ? 'completado' : rec ? 'en-curso' : disponible ? 'nuevo' : 'preparacion';
                return (
                  <li key={d}>
                    <Enlace
                      to={{ name: 'dia', day: d }}
                      className={cx(
                        'flex items-center gap-3 rounded-2xl px-3 py-2.5 ring-1 transition',
                        estado === 'completado' && 'bg-calma-salvia/15 ring-calma-salvia/40',
                        estado === 'en-curso' && 'bg-white ring-2 ring-calma-salvia',
                        estado === 'nuevo' && 'bg-white ring-calma-linea hover:ring-calma-salvia',
                        estado === 'preparacion' && 'border border-dashed border-calma-linea bg-transparent ring-0',
                      )}
                    >
                      <span
                        className={cx(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold tabular-nums',
                          estado === 'completado' ? 'bg-calma-verde text-white' : estado === 'preparacion' ? 'bg-calma-crema text-calma-gris' : 'bg-calma-crema text-calma-verde',
                        )}
                      >
                        {estado === 'completado' ? <Check aria-label="Completado" className="h-4 w-4" /> : d}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={cx('truncate text-[15px] font-medium', estado === 'preparacion' ? 'text-calma-gris' : 'text-calma-tinta')}>{titulo}</span>
                        <span className="text-xs text-calma-gris">
                          Día {d}
                          {estado === 'en-curso' ? ' · En curso' : ''}
                          {rec?.challenge === 'pendiente' ? ' · Reto pendiente' : ''}
                        </span>
                      </span>
                      {podcastIdForDay(d) && <Headphones aria-label="Incluye podcast" className="h-4 w-4 shrink-0 text-calma-salvia" />}
                    </Enlace>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function Leyenda() {
  const item = (cls: string, label: string) => (
    <li className="flex items-center gap-1.5">
      <span aria-hidden className={cx('h-3 w-3 rounded', cls)} />
      {label}
    </li>
  );
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-calma-gris" aria-label="Leyenda">
      {item('bg-calma-verde', 'Completado')}
      {item('bg-white ring-2 ring-calma-salvia', 'En curso')}
      {item('bg-white ring-1 ring-calma-linea', 'Por empezar')}
      <li className="flex items-center gap-1.5">
        <Headphones aria-hidden className="h-3.5 w-3.5 text-calma-salvia" /> Con podcast
      </li>
    </ul>
  );
}
