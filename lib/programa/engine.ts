/**
 * Motor de contenidos del programa de 60 días.
 * Valida cada lección y podcast, arma el catálogo y responde qué mostrar en cada día.
 * Es puro (sin acceso a almacenamiento) para poder probarlo y reutilizarlo en Capacitor.
 */
import type { DayRecord, DayView, Lesson, Podcast, Unit } from '@/types/programa';
import { PREGUNTA_AUTOEVALUACION, TOTAL_DAYS, UNIDADES } from '@/content/programa/unidades';
import { podcastIdForDay } from '@/content/podcasts/episodios';
import { LECCIONES, PODCASTS } from '@/content/programa/cargar';

export const READING_MIN_WORDS = 150;
export const READING_MAX_WORDS = 220;

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

export function unitForDay(day: number): Unit {
  const unit = UNIDADES.find((u) => day >= u.firstDay && day <= u.lastDay);
  if (!unit) throw new RangeError(`Día fuera del programa: ${day}`);
  return unit;
}

export const isValidDay = (day: number): boolean => Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS;

/** Problemas que impiden mostrar una lección. Vacío = válida. */
export function validateLesson(l: Lesson): string[] {
  const e: string[] = [];
  const req = (v: unknown, name: string) => {
    if (typeof v !== 'string' || v.trim() === '') e.push(`${name} vacío`);
  };
  if (!isValidDay(l.day)) e.push(`day inválido: ${l.day}`);
  else {
    if (l.unit !== unitForDay(l.day).id) e.push(`unit debe ser ${unitForDay(l.day).id}`);
    if (l.podcastId !== podcastIdForDay(l.day)) e.push(`podcastId debe ser ${podcastIdForDay(l.day) ?? 'null'}`);
  }
  for (const k of ['title', 'objective', 'reading', 'example', 'reflectionQuestion', 'experienceQuestion', 'dailyChallenge', 'closingMessage'] as const) req(l[k], k);
  const words = wordCount(l.reading ?? '');
  if (words < READING_MIN_WORDS || words > READING_MAX_WORDS) e.push(`reading tiene ${words} palabras (150–220)`);
  if (l.selfEvaluation?.question !== PREGUNTA_AUTOEVALUACION) e.push('selfEvaluation.question debe ser la pregunta estándar');
  if (l.selfEvaluation?.options?.length !== 5) e.push('selfEvaluation debe tener 5 opciones');
  if (!Array.isArray(l.quiz) || l.quiz.length < 1 || l.quiz.length > 3) e.push('quiz debe tener de 1 a 3 preguntas');
  for (const q of l.quiz ?? []) {
    req(q.prompt, `quiz ${q.id} pregunta`);
    req(q.explanation, `quiz ${q.id} explicación`);
    if (q.options.length < 2) e.push(`quiz ${q.id}: al menos 2 opciones`);
    if (!q.options.some((o) => o.id === q.bestOptionId)) e.push(`quiz ${q.id}: la respuesta indicada no existe`);
    q.options.forEach((o) => req(o.text, `quiz ${q.id}.${o.id} texto`));
  }
  return e;
}

/** Problemas que impiden publicar un podcast; si los hay, se muestra como "Próximamente". */
export function validatePodcast(p: Podcast): string[] {
  const e: string[] = [];
  if (podcastIdForDay(p.day) !== p.id) e.push(`${p.id}: no corresponde al día ${p.day}`);
  if (p.status !== 'en-preparacion') {
    if (!p.title?.trim()) e.push(`${p.id}: falta título`);
    if (!p.audioUrl && !p.script) e.push(`${p.id}: falta audio o guion`);
    if (p.durationMin !== undefined && (p.durationMin < 5 || p.durationMin > 8)) e.push(`${p.id}: duración debe ser 5 a 8 minutos`);
  }
  return e;
}

export interface Catalog {
  lessons: Map<number, Lesson>;
  podcasts: Map<string, Podcast>;
  /** Lecciones descartadas por no pasar la validación (se muestran "en preparación"). */
  rejected: Array<{ id: string; errors: string[] }>;
}

export function buildCatalog(lessonsIn: Lesson[], podcastsIn: Podcast[]): Catalog {
  const lessons = new Map<number, Lesson>();
  const rejected: Catalog['rejected'] = [];
  for (const l of lessonsIn) {
    const errors = validateLesson(l);
    if (l.status === 'borrador') errors.push('borrador');
    if (lessons.has(l.day)) errors.push(`día ${l.day} repetido`);
    if (errors.length) rejected.push({ id: l.id, errors });
    else lessons.set(l.day, l);
  }
  const podcasts = new Map<string, Podcast>();
  for (const p of podcastsIn) {
    podcasts.set(p.id, validatePodcast(p).length ? { id: p.id, day: p.day, number: p.number, status: 'en-preparacion', title: p.title } : p);
  }
  return { lessons, podcasts, rejected };
}

let defaultCatalog: Catalog | null = null;
export function getCatalog(): Catalog {
  if (!defaultCatalog) {
    defaultCatalog = buildCatalog(LECCIONES, PODCASTS);
    if (defaultCatalog.rejected.length && process.env.NODE_ENV !== 'production') {
      console.warn('[CALMA] Lecciones que no pasan la validación:', defaultCatalog.rejected);
    }
  }
  return defaultCatalog;
}

export function getDayView(day: number, catalog: Catalog = getCatalog()): DayView {
  const unit = unitForDay(day);
  const pid = podcastIdForDay(day);
  const podcast = pid ? catalog.podcasts.get(pid) ?? null : null;
  const lesson = catalog.lessons.get(day);
  return lesson ? { kind: 'disponible', day, unit, lesson, podcast } : { kind: 'en-preparacion', day, unit, podcast };
}

export const allDays = (): number[] => Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

/**
 * Día sugerido para "Continuar mi aprendizaje": el primer día disponible sin completar.
 * Si todos los disponibles están completos, el último disponible. Sin contenido: día 1.
 * No exige días consecutivos ni penaliza inactividad.
 */
export function suggestedDay(records: Pick<DayRecord, 'day' | 'state'>[], catalog: Catalog = getCatalog()): number {
  const done = new Set(records.filter((r) => r.state === 'completado').map((r) => r.day));
  const available = [...catalog.lessons.keys()].sort((a, b) => a - b);
  const next = available.find((d) => !done.has(d));
  return next ?? available.at(-1) ?? 1;
}

/* ---------- Revisión editorial (avisos, no bloquean la publicación) ---------- */

export interface QualityReport {
  /** Oraciones que se repiten idénticas en 10 o más lecturas. */
  sharedSentences: Array<{ sentence: string; lessons: number }>;
  /** Porcentaje promedio de cada lectura formado por esas oraciones compartidas. */
  avgSharedShare: number;
  /** Días cuyo objetivo o cierre sigue una plantilla con el título insertado. */
  templatedObjectives: number;
  templatedClosings: number;
  /** Preguntas de quiz sin explicación propia para cada opción. */
  quizWithoutPerOptionExplanations: number;
}

const sentences = (t: string) => t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

export function contentQualityReport(lessons: Lesson[] = LECCIONES): QualityReport {
  const counts = new Map<string, number>();
  for (const l of lessons) for (const s of new Set(sentences(l.reading))) counts.set(s, (counts.get(s) ?? 0) + 1);
  const shared = new Set([...counts].filter(([, c]) => c >= 10).map(([s]) => s));
  const shares = lessons.map((l) => {
    const total = wordCount(l.reading) || 1;
    return sentences(l.reading).filter((s) => shared.has(s)).reduce((n, s) => n + wordCount(s), 0) / total;
  });
  const stripTitle = (text: string, title: string) => text.toLowerCase().replace(title.toLowerCase(), '§');
  const mostCommon = (xs: string[]) => Math.max(0, ...[...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>()).values()]);
  return {
    sharedSentences: [...counts].filter(([, c]) => c >= 10).map(([sentence, c]) => ({ sentence, lessons: c })).sort((a, b) => b.lessons - a.lessons),
    avgSharedShare: shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : 0,
    templatedObjectives: mostCommon(lessons.map((l) => stripTitle(l.objective, l.title))),
    templatedClosings: mostCommon(lessons.map((l) => stripTitle(l.closingMessage, l.title))),
    quizWithoutPerOptionExplanations: lessons.flatMap((l) => l.quiz).filter((q) => q.options.some((o) => !o.explanation)).length,
  };
}
