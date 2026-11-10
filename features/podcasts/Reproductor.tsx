'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { cx } from '@/components/ui';

const SPEEDS = [0.75, 1, 1.25, 1.5];
const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '–:––');

/** Reproductor accesible: reproducir/pausar, retroceder y avanzar 15 s, velocidad y barra de posición. */
export function Reproductor({ src, title, onPlayed }: { src: string; title: string; onPlayed?: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const on = (ev: string, fn: () => void) => {
      a.addEventListener(ev, fn);
      return () => a.removeEventListener(ev, fn);
    };
    const offs = [
      on('play', () => setPlaying(true)),
      on('pause', () => setPlaying(false)),
      on('timeupdate', () => {
        setTime(a.currentTime);
        if (!notified.current && a.duration > 0 && a.currentTime / a.duration > 0.8) {
          notified.current = true;
          onPlayed?.();
        }
      }),
      on('loadedmetadata', () => setDuration(a.duration)),
      on('error', () => setError(true)),
    ];
    return () => offs.forEach((f) => f());
  }, [onPlayed]);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setError(true));
    else a.pause();
  };
  const skip = (d: number) => {
    const a = audio.current;
    if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0) - 0.1, a.currentTime + d));
  };

  if (error) {
    return <p className="rounded-2xl bg-calma-crema px-4 py-3 text-sm text-calma-verde">No se pudo cargar el audio. Revisá tu conexión e intentá de nuevo más tarde.</p>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-calma-verde p-4 text-white">
      <audio ref={audio} src={src} preload="metadata" />
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => skip(-15)} aria-label="Retroceder 15 segundos" className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10">
          <RotateCcw aria-hidden className="h-5 w-5" />
        </button>
        <button type="button" onClick={toggle} aria-label={playing ? `Pausar ${title}` : `Reproducir ${title}`} className="grid h-14 w-14 place-items-center rounded-full bg-white text-calma-verde">
          {playing ? <Pause aria-hidden className="h-6 w-6" /> : <Play aria-hidden className="ml-0.5 h-6 w-6" />}
        </button>
        <button type="button" onClick={() => skip(15)} aria-label="Avanzar 15 segundos" className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10">
          <RotateCw aria-hidden className="h-5 w-5" />
        </button>
      </div>
      <label className="flex items-center gap-3 text-xs tabular-nums text-white/80">
        <span className="w-10 text-right">{fmt(time)}</span>
        <input
          type="range"
          min={0}
          max={Number.isFinite(duration) ? duration : 0}
          step={1}
          value={time}
          onChange={(e) => {
            if (audio.current) audio.current.currentTime = Number(e.target.value);
          }}
          aria-label="Posición del audio"
          className="h-1.5 flex-1 accent-calma-salvia"
        />
        <span className="w-10">{fmt(duration)}</span>
      </label>
      <div className="flex items-center justify-center gap-1" role="group" aria-label="Velocidad de reproducción">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={speed === s}
            onClick={() => {
              setSpeed(s);
              if (audio.current) audio.current.playbackRate = s;
            }}
            className={cx('rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums', speed === s ? 'bg-white text-calma-verde' : 'text-white/80 hover:bg-white/10')}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
