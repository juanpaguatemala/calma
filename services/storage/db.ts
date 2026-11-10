/**
 * Datos privados de CALMA en IndexedDB (Dexie). Nada sale del dispositivo.
 * IndexedDB es almacenamiento local, NO cifrado.
 *
 * Base propia "calma-programa" para no alterar el esquema de otras bases del proyecto.
 * Las migraciones futuras deben ser aditivas (nuevas versiones con .upgrade), nunca destructivas.
 */
import Dexie, { type Table } from 'dexie';
import type { DayRecord, ExportFile, PodcastRecord, Preferences, SafetyPlan } from '@/types/programa';

export const DB_NAME = 'calma-programa';
/** Base del antiguo módulo "Habla con Calma"; solo se borra si la persona lo pide. */
export const LEGACY_HABLA_DB = 'calma-habla';

class CalmaDB extends Dexie {
  days!: Table<DayRecord, number>;
  podcasts!: Table<PodcastRecord, string>;
  preferences!: Table<Preferences, string>;
  safetyPlan!: Table<SafetyPlan, string>;
  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      days: 'day, state, updatedAt',
      podcasts: 'podcastId',
      preferences: 'key',
      safetyPlan: 'key',
    });
  }
}

let db: CalmaDB | null = null;
const getDB = () => (db ??= new CalmaDB());

export function emptyDay(day: number, now = Date.now()): DayRecord {
  return {
    day,
    state: 'no-iniciado',
    reflection: '',
    experience: '',
    experienceSkipped: false,
    quizAnswers: {},
    challenge: null,
    usefulness: null,
    firstOpenedAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

/* ---------- Días ---------- */

export async function getDay(day: number): Promise<DayRecord | undefined> {
  return getDB().days.get(day);
}

export async function listDays(): Promise<DayRecord[]> {
  return getDB().days.orderBy('day').toArray();
}

/** Combina cambios sobre el registro del día; lo crea si no existe y lo marca "en curso". */
export async function saveDay(day: number, patch: Partial<Omit<DayRecord, 'day'>>): Promise<DayRecord> {
  const d = getDB();
  return d.transaction('rw', d.days, async () => {
    const now = Date.now();
    const prev = (await d.days.get(day)) ?? emptyDay(day, now);
    const next: DayRecord = { ...prev, ...patch, day, updatedAt: now };
    if (next.state === 'no-iniciado') next.state = 'en-curso';
    if (patch.state === 'completado' && !prev.completedAt) next.completedAt = now;
    if (patch.state && patch.state !== 'completado') next.completedAt = null;
    await d.days.put(next);
    return next;
  });
}

export async function deleteDay(day: number): Promise<void> {
  await getDB().days.delete(day);
}

/* ---------- Podcasts ---------- */

export async function getPodcast(podcastId: string): Promise<PodcastRecord | undefined> {
  return getDB().podcasts.get(podcastId);
}

export async function listPodcastRecords(): Promise<PodcastRecord[]> {
  return getDB().podcasts.toArray();
}

export async function savePodcast(podcastId: string, patch: Partial<Omit<PodcastRecord, 'podcastId'>>): Promise<PodcastRecord> {
  const d = getDB();
  const prev = (await d.podcasts.get(podcastId)) ?? { podcastId, reflection: '', listened: false, updatedAt: 0 };
  const next = { ...prev, ...patch, podcastId, updatedAt: Date.now() };
  await d.podcasts.put(next);
  return next;
}

/* ---------- Preferencias y plan de seguridad ---------- */

export async function getPreferences(): Promise<Preferences> {
  return (await getDB().preferences.get('prefs')) ?? { key: 'prefs', displayName: '' };
}

export async function savePreferences(patch: Partial<Omit<Preferences, 'key'>>): Promise<Preferences> {
  const next = { ...(await getPreferences()), ...patch, key: 'prefs' as const };
  await getDB().preferences.put(next);
  return next;
}

export const emptySafetyPlan = (): SafetyPlan => ({
  key: 'plan',
  warningSigns: '',
  calmingSteps: '',
  safePlace: '',
  supportPeople: '',
  professionalHelp: '',
  updatedAt: 0,
});

export async function getSafetyPlan(): Promise<SafetyPlan> {
  return (await getDB().safetyPlan.get('plan')) ?? emptySafetyPlan();
}

export async function saveSafetyPlan(patch: Partial<Omit<SafetyPlan, 'key'>>): Promise<SafetyPlan> {
  const next = { ...(await getSafetyPlan()), ...patch, key: 'plan' as const, updatedAt: Date.now() };
  await getDB().safetyPlan.put(next);
  return next;
}

/* ---------- Exportar y borrar ---------- */

export async function exportAll(): Promise<ExportFile> {
  const d = getDB();
  return {
    app: 'CALMA',
    version: 1,
    exportedAt: new Date().toISOString(),
    days: await d.days.orderBy('day').toArray(),
    podcasts: await d.podcasts.toArray(),
    preferences: (await d.preferences.get('prefs')) ?? null,
    safetyPlan: (await d.safetyPlan.get('plan')) ?? null,
  };
}

/** Borra todos los datos del programa. No toca la base antigua de Habla con Calma. */
export async function deleteAll(): Promise<void> {
  const d = getDB();
  await d.transaction('rw', [d.days, d.podcasts, d.preferences, d.safetyPlan], async () => {
    await Promise.all([d.days.clear(), d.podcasts.clear(), d.preferences.clear(), d.safetyPlan.clear()]);
  });
}

export async function legacyHablaExists(): Promise<boolean> {
  try {
    return await Dexie.exists(LEGACY_HABLA_DB);
  } catch {
    return false;
  }
}

/** Solo con confirmación explícita de la persona. */
export async function deleteLegacyHabla(): Promise<void> {
  await Dexie.delete(LEGACY_HABLA_DB);
}
