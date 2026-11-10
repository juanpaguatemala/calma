'use client';

import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import type { DayRecord } from '@/types/programa';
import { getDayView } from '@/lib/programa/engine';
import { Enlace } from '@/lib/navegacion/rutas';
import { useAllRecords } from '@/features/datos/hooks';
import * as db from '@/services/storage/db';
import { PODCASTS } from '@/content/podcasts/episodios';
import { Aviso, Cargando, Confirmar, Tarjeta, TituloPagina, cx } from '@/components/ui';

type Filtro = 'todo' | 'pendientes' | 'reflexiones';
const FILTROS: Array<{ id: Filtro; label: string }> = [
  { id: 'todo', label: 'Todo' },
  { id: 'pendientes', label: 'Retos pendientes' },
  { id: 'reflexiones', label: 'Con reflexión' },
];

const RETO_LABEL = { practicado: 'Reto practicado', pendiente: 'Reto pendiente', omitido: 'Reto omitido' } as const;

const tieneContenido = (r: DayRecord) => Boolean(r.reflection.trim() || r.experience.trim() || r.challenge || Object.keys(r.quizAnswers).length || r.usefulness);

export function Ejercicios() {
  const { days, podcasts, error, reload } = useAllRecords();
  const [filtro, setFiltro] = useState<Filtro>('todo');
  if (!days || !podcasts) return <Cargando />;

  const conDatos = days.filter(tieneContenido).sort((a, b) => b.updatedAt - a.updatedAt);
  const lista = conDatos.filter((r) => (filtro === 'pendientes' ? r.challenge === 'pendiente' : filtro === 'reflexiones' ? Boolean(r.reflection.trim() || r.experience.trim()) : true));
  const reflexionesPodcast = podcasts.filter((p) => p.reflection.trim());

  return (
    <div className="flex flex-col gap-5">
      <TituloPagina eyebrow="Ejercicios y reflexiones" title="Lo que fuiste trabajando" intro="Tus respuestas, retos y reflexiones. Son privados, se pueden editar y viven solo en este dispositivo." />
      {error && <Aviso tone="error">{error}</Aviso>}

      <div role="tablist" aria-label="Filtrar" className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filtro === f.id} onClick={() => setFiltro(f.id)} className={cx('min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 transition', filtro === f.id ? 'bg-calma-verde text-white ring-calma-verde' : 'bg-white text-calma-verde ring-calma-linea')}>
            {f.label}
          </button>
        ))}
      </div>

      {conDatos.length === 0 ? (
        <Tarjeta>
          <p className="text-[15px] leading-relaxed text-calma-tinta">Todavía no hay ejercicios guardados. Cuando escribas una reflexión, respondas un quiz o marques un reto, aparecerá aquí.</p>
          <Enlace to={{ name: 'programa' }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-calma-verde">
            Ir al programa <ChevronRight aria-hidden className="h-4 w-4" />
          </Enlace>
        </Tarjeta>
      ) : lista.length === 0 ? (
        <Aviso>{filtro === 'pendientes' ? 'No tenés retos pendientes.' : 'No hay reflexiones escritas todavía.'}</Aviso>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((r) => {
            const view = getDayView(r.day);
            const titulo = view.kind === 'disponible' ? view.lesson.title : `Día ${r.day}`;
            return (
              <li key={r.day}>
                <Tarjeta as="article" className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-calma-gris tabular-nums">
                        Día {r.day} · {new Date(r.updatedAt).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })}
                      </p>
                      <h2 className="font-display text-lg font-semibold text-calma-verde">{titulo}</h2>
                    </div>
                    {r.challenge && (
                      <span className={cx('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', r.challenge === 'practicado' ? 'bg-calma-salvia/25 text-calma-verde' : r.challenge === 'pendiente' ? 'bg-calma-terracota/15 text-[#8a4f3b]' : 'bg-calma-crema text-calma-gris')}>
                        {RETO_LABEL[r.challenge]}
                      </span>
                    )}
                  </div>
                  {r.reflection.trim() && <Extracto label="Mi reflexión" text={r.reflection} />}
                  {r.experience.trim() && <Extracto label="Mi experiencia" text={r.experience} />}
                  <div className="flex flex-wrap items-center gap-3">
                    <Enlace to={{ name: 'dia', day: r.day }} className="inline-flex items-center gap-1 text-sm font-semibold text-calma-verde">
                      {r.challenge === 'pendiente' ? 'Retomar' : 'Abrir y editar'} <ChevronRight aria-hidden className="h-4 w-4" />
                    </Enlace>
                    <div className="ml-auto">
                      <Confirmar
                        variant="suave"
                        trigger={
                          <>
                            <Trash2 aria-hidden className="h-4 w-4" /> Borrar
                          </>
                        }
                        question={`¿Borrar todo lo guardado del día ${r.day}? No se puede deshacer.`}
                        confirmLabel="Borrar este día"
                        onConfirm={async () => {
                          await db.deleteDay(r.day);
                          await reload();
                        }}
                      />
                    </div>
                  </div>
                </Tarjeta>
              </li>
            );
          })}
        </ul>
      )}

      {reflexionesPodcast.length > 0 && (
        <section aria-labelledby="refl-podcasts" className="flex flex-col gap-3">
          <h2 id="refl-podcasts" className="font-display text-lg font-semibold text-calma-verde">
            Reflexiones de podcasts
          </h2>
          {reflexionesPodcast.map((p) => {
            const ep = PODCASTS.find((x) => x.id === p.podcastId);
            return (
              <Tarjeta key={p.podcastId} as="article">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-calma-gris">Episodio {ep?.number}</p>
                <Extracto label={ep?.title ?? p.podcastId} text={p.reflection} />
                <Enlace to={{ name: 'podcast', id: p.podcastId }} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-calma-verde">
                  Abrir <ChevronRight aria-hidden className="h-4 w-4" />
                </Enlace>
              </Tarjeta>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Extracto({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-calma-gris">{label}</p>
      <p className="line-clamp-3 whitespace-pre-line text-[15px] leading-relaxed text-calma-tinta">{text}</p>
    </div>
  );
}
