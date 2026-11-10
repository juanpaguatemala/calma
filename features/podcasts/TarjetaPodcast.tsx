'use client';

import { ChevronRight, Headphones } from 'lucide-react';
import type { Podcast } from '@/types/programa';
import { Enlace } from '@/lib/navegacion/rutas';
import { cx } from '@/components/ui';

export function estadoPodcast(p: Podcast): { label: string; tone: 'ok' | 'aviso' | 'pronto' } {
  if (p.status === 'en-preparacion') return { label: 'Próximamente', tone: 'pronto' };
  if (!p.audioUrl) return { label: 'Guion disponible · audio próximamente', tone: 'pronto' };
  if (p.status === 'por-verificar') return { label: 'Audio pendiente de verificación', tone: 'aviso' };
  return { label: p.durationMin ? `${p.durationMin} min` : 'Disponible', tone: 'ok' };
}

export function TarjetaPodcast({ podcast, escuchado }: { podcast: Podcast; escuchado?: boolean }) {
  const estado = estadoPodcast(podcast);
  const titulo = podcast.status === 'en-preparacion' ? `Episodio ${podcast.number}` : podcast.title ?? `Episodio ${podcast.number}`;
  return (
    <Enlace to={{ name: 'podcast', id: podcast.id }} className="group flex items-center gap-3 rounded-calma bg-white p-4 ring-1 ring-calma-linea transition hover:ring-calma-salvia">
      <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', estado.tone === 'pronto' ? 'bg-calma-crema text-calma-gris' : 'bg-calma-salvia/25 text-calma-verde')}>
        <Headphones aria-hidden className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-calma-gris tabular-nums">
          Episodio {podcast.number} · Día {podcast.day}
          {escuchado ? ' · Escuchado' : ''}
        </span>
        <span className={cx('truncate font-semibold', estado.tone === 'pronto' ? 'text-calma-gris' : 'text-calma-verde')}>{titulo}</span>
        <span className={cx('text-xs', estado.tone === 'aviso' ? 'text-[#8a4f3b]' : 'text-calma-gris')}>{estado.label}</span>
      </span>
      <ChevronRight aria-hidden className="h-5 w-5 shrink-0 text-calma-gris transition group-hover:translate-x-0.5" />
    </Enlace>
  );
}
