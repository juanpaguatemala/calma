'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, Hourglass, ShieldAlert } from 'lucide-react';
import { getCatalog } from '@/lib/programa/engine';
import { Enlace } from '@/lib/navegacion/rutas';
import { useAllRecords, usePodcastRecord } from '@/features/datos/hooks';
import { Aviso, Boton, CampoTexto, Cargando, EstadoGuardado, Eyebrow, Tarjeta, TituloPagina } from '@/components/ui';
import { Reproductor } from './Reproductor';
import { TarjetaPodcast } from './TarjetaPodcast';

export function Podcasts() {
  const { podcasts: records } = useAllRecords();
  const episodios = [...getCatalog().podcasts.values()].sort((a, b) => a.number - b.number);
  const escuchados = new Set((records ?? []).filter((r) => r.listened).map((r) => r.podcastId));
  return (
    <div className="flex flex-col gap-5">
      <TituloPagina eyebrow="Podcasts" title="Para escuchar con calma" intro="Un episodio cada cuatro días del programa. Podés escucharlos en cualquier orden." />
      <ul className="flex flex-col gap-2">
        {episodios.map((p) => (
          <li key={p.id}>
            <TarjetaPodcast podcast={p} escuchado={escuchados.has(p.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PodcastDetalle({ id }: { id: string }) {
  const podcast = getCatalog().podcasts.get(id);
  const { record, saveState, update } = usePodcastRecord(id);
  const [verGuion, setVerGuion] = useState(false);
  if (!podcast) return <Aviso tone="error">Ese episodio no existe.</Aviso>;

  const preparando = podcast.status === 'en-preparacion';
  return (
    <div className="flex flex-col gap-5">
      <Enlace to={{ name: 'podcasts' }} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-calma-verde">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Podcasts
      </Enlace>
      <header className="flex flex-col gap-1.5">
        <Eyebrow>
          Episodio {podcast.number} · Día {podcast.day}
          {podcast.durationMin ? ` · ${podcast.durationMin} min` : ''}
        </Eyebrow>
        <h1 className="text-balance font-display text-[28px] font-semibold leading-tight text-calma-verde">{preparando ? `Episodio ${podcast.number}` : podcast.title}</h1>
        {!preparando && podcast.description && podcast.status === 'disponible' && <p className="max-w-prose text-[15px] leading-relaxed text-calma-gris">{podcast.description}</p>}
      </header>

      {preparando ? (
        <Tarjeta className="flex gap-3">
          <Hourglass aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-calma-gris" />
          <div>
            <p className="font-semibold text-calma-verde">Próximamente</p>
            <p className="mt-1 text-[15px] leading-relaxed text-calma-tinta">Este episodio todavía se está preparando.</p>
          </div>
        </Tarjeta>
      ) : (
        <>
          {podcast.status === 'por-verificar' && (
            <p className="flex gap-2 rounded-2xl bg-calma-terracota/10 px-4 py-3 text-sm text-[#7e4634] ring-1 ring-calma-terracota/40">
              <ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              Audio aportado por el equipo de CALMA. Su contenido y sus derechos están pendientes de verificación.
            </p>
          )}
          {podcast.audioUrl ? (
            <Reproductor src={podcast.audioUrl} title={podcast.title ?? `Episodio ${podcast.number}`} onPlayed={() => update({ listened: true })} />
          ) : (
            <Aviso>Audio próximamente. Mientras tanto, podés leer el guion.</Aviso>
          )}
          {podcast.script && (
            <Tarjeta>
              <Boton variant="suave" aria-expanded={verGuion} onClick={() => setVerGuion((v) => !v)}>
                <FileText aria-hidden className="h-4 w-4" /> {verGuion ? 'Ocultar guion' : 'Leer el guion'}
              </Boton>
              {verGuion && <div className="mt-4 max-w-prose whitespace-pre-line text-[15px] leading-[1.7] text-calma-tinta">{podcast.script}</div>}
            </Tarjeta>
          )}
          <Tarjeta>
            {!record ? (
              <Cargando />
            ) : (
              <div className="flex flex-col gap-2">
                <CampoTexto
                  id={`podcast-reflexion-${podcast.id}`}
                  label="¿Qué te llevás de este episodio?"
                  hint="Reflexión opcional y privada."
                  value={record.reflection}
                  onChange={(v) => update({ reflection: v }, { delay: 600 })}
                />
                <EstadoGuardado state={saveState} />
              </div>
            )}
          </Tarjeta>
        </>
      )}
    </div>
  );
}
