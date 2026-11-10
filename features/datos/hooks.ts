'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DayRecord, PodcastRecord, Preferences, SafetyPlan } from '@/types/programa';
import * as db from '@/services/storage/db';

export type SaveState = 'idle' | 'guardando' | 'guardado' | 'error';

/**
 * Carga un registro y devuelve una función para actualizarlo.
 * Los cambios se aplican al instante en pantalla y se guardan con un pequeño retraso
 * para no escribir en cada tecla.
 */
function useStored<T>(load: () => Promise<T>, save: (patch: Partial<T>) => Promise<T>, deps: unknown[]) {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const pending = useRef<Partial<T>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    let alive = true;
    setValue(null);
    setError(null);
    load()
      .then((v) => alive && setValue(v))
      .catch(() => alive && setError('No se pudieron leer tus datos en este dispositivo.'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length === 0) return;
    setSaveState('guardando');
    try {
      const saved = await saveRef.current(patch);
      setValue((cur) => (cur ? { ...saved, ...pending.current } : saved));
      setSaveState('guardado');
    } catch {
      setSaveState('error');
    }
  }, []);

  const update = useCallback(
    (patch: Partial<T>, opts: { delay?: number } = {}) => {
      setValue((cur) => (cur ? { ...cur, ...patch } : cur));
      pending.current = { ...pending.current, ...patch };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), opts.delay ?? 0);
    },
    [flush],
  );

  // Guarda lo pendiente al salir de la pantalla.
  useEffect(() => () => void flush(), [flush]);

  return { value, error, saveState, update, flush };
}

export function useDayRecord(day: number) {
  const s = useStored<DayRecord>(
    async () => (await db.getDay(day)) ?? db.emptyDay(day),
    (patch) => db.saveDay(day, patch),
    [day],
  );
  return { record: s.value, error: s.error, saveState: s.saveState, update: s.update };
}

export function usePodcastRecord(id: string) {
  const s = useStored<PodcastRecord>(
    async () => (await db.getPodcast(id)) ?? { podcastId: id, reflection: '', listened: false, updatedAt: 0 },
    (patch) => db.savePodcast(id, patch),
    [id],
  );
  return { record: s.value, error: s.error, saveState: s.saveState, update: s.update };
}

export function usePreferences() {
  const s = useStored<Preferences>(db.getPreferences, db.savePreferences, []);
  return { prefs: s.value, error: s.error, saveState: s.saveState, update: s.update };
}

export function useSafetyPlan() {
  const s = useStored<SafetyPlan>(db.getSafetyPlan, db.saveSafetyPlan, []);
  return { plan: s.value, error: s.error, saveState: s.saveState, update: s.update };
}

/** Lista de todos los días con actividad (para Inicio, Ejercicios y Avances). */
export function useAllRecords() {
  const [days, setDays] = useState<DayRecord[] | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([db.listDays(), db.listPodcastRecords()]);
      setDays(d);
      setPodcasts(p);
      setError(null);
    } catch {
      setDays([]);
      setPodcasts([]);
      setError('No se pudieron leer tus datos en este dispositivo.');
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { days, podcasts, error, reload };
}
