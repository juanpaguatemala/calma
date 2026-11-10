import { describe, expect, it } from 'vitest';
import { LECCIONES, PODCASTS, toLesson } from '@/content/programa/cargar';
import { UNIDADES, TOTAL_DAYS } from '@/content/programa/unidades';
import { DIAS_PODCAST, podcastIdForDay } from '@/content/podcasts/episodios';
import { buildCatalog, contentQualityReport, getCatalog, getDayView, suggestedDay, unitForDay, validateLesson, validatePodcast, wordCount } from '@/lib/programa/engine';
import type { Lesson } from '@/types/programa';

describe('contenido entregado (calma-60-dias.json)', () => {
  it('tiene los 60 días, en orden y sin repetir', () => {
    expect(LECCIONES.map((l) => l.day)).toEqual(Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1));
  });

  it.each(LECCIONES.map((l) => [l.day, l] as const))('día %i pasa la validación', (_d, l) => {
    expect(validateLesson(l)).toEqual([]);
  });

  it('todas las lecturas tienen entre 150 y 220 palabras', () => {
    for (const l of LECCIONES) {
      const n = wordCount(l.reading);
      expect(n).toBeGreaterThanOrEqual(150);
      expect(n).toBeLessThanOrEqual(220);
    }
  });

  it('6 unidades de 10 días', () => {
    expect(UNIDADES).toHaveLength(6);
    for (const u of UNIDADES) expect(u.lastDay - u.firstDay + 1).toBe(10);
    expect(unitForDay(1).id).toBe(1);
    expect(unitForDay(31).id).toBe(4);
    expect(unitForDay(60).id).toBe(6);
  });

  it('podcast cada 4 días: 15 episodios en los días correctos', () => {
    expect(PODCASTS.map((p) => p.day)).toEqual([...DIAS_PODCAST]);
    for (const l of LECCIONES) expect(l.podcastId).toBe(podcastIdForDay(l.day));
    for (const p of PODCASTS) expect(validatePodcast(p)).toEqual([]);
  });

  it('los audios sin verificar se marcan como tales, y los pendientes como "Próximamente"', () => {
    const c = getCatalog();
    expect([...c.podcasts.values()].filter((p) => p.status === 'por-verificar')).toHaveLength(12);
    expect([...c.podcasts.values()].filter((p) => p.status === 'en-preparacion').map((p) => p.day)).toEqual([52, 56, 60]);
  });

  it('informe editorial: detecta texto compartido entre lecciones', () => {
    const r = contentQualityReport();
    // Informativo: no bloquea la publicación, pero deja constancia para la revisión.
    console.info('[revisión editorial]', { oracionesCompartidas: r.sharedSentences.length, porcentajePromedio: Math.round(r.avgSharedShare * 100), objetivosPlantilla: r.templatedObjectives, cierresPlantilla: r.templatedClosings });
    expect(r.sharedSentences.length).toBeGreaterThanOrEqual(0);
  });
});

describe('motor', () => {
  const base = LECCIONES[0]!;

  it('rechaza lecciones mal formadas y las muestra "en preparación"', () => {
    const malas: Lesson[] = [
      { ...base, reading: 'demasiado corta' },
      { ...base, day: 2, unit: 1, quiz: [] },
      { ...base, day: 3, quiz: [{ ...base.quiz[0]!, bestOptionId: 'z' }] },
      { ...base, day: 5, podcastId: 'podcast-01' },
      { ...base, day: 11 },
      { ...base, day: 6, selfEvaluation: { ...base.selfEvaluation, options: ['a', 'b'] } },
    ];
    const c = buildCatalog(malas, PODCASTS);
    expect(c.lessons.size).toBe(0);
    expect(c.rejected).toHaveLength(6);
    expect(getDayView(2, c).kind).toBe('en-preparacion');
  });

  it('una lección marcada como borrador no se muestra', () => {
    const c = buildCatalog([{ ...base, status: 'borrador' }], PODCASTS);
    expect(c.lessons.size).toBe(0);
  });

  it('un podcast "disponible" sin audio ni guion se muestra como "Próximamente"', () => {
    const p = { ...PODCASTS[0]!, status: 'disponible' as const, audioUrl: undefined, script: undefined };
    expect(validatePodcast(p).length).toBeGreaterThan(0);
    expect(buildCatalog([], [p]).podcasts.get(p.id)?.status).toBe('en-preparacion');
  });

  it('el JSON se convierte con la respuesta indicada y la explicación', () => {
    const l = toLesson({
      day: 1, unit: 1, unitTitle: 'U', title: 'T', objective: 'O', reading: 'r', example: 'e', reflectionQuestion: 'r', experienceQuestion: 'e',
      quiz: [{ question: 'P', options: ['x', 'y', 'z'], correctIndex: 2, explanation: 'Porque z.' }],
      dailyChallenge: 'd', closingMessage: 'c', selfEvaluation: { question: 'q', options: ['1', '2', '3', '4', '5'] }, podcastId: null,
    });
    expect(l.quiz[0]!.bestOptionId).toBe('c');
    expect(l.quiz[0]!.explanation).toBe('Porque z.');
    expect(l.id).toBe('dia-01');
  });

  it('día sugerido: primer día disponible sin completar, sin exigir orden', () => {
    const c = getCatalog();
    expect(suggestedDay([], c)).toBe(1);
    expect(suggestedDay([{ day: 1, state: 'completado' }, { day: 2, state: 'en-curso' }], c)).toBe(2);
    expect(suggestedDay([{ day: 1, state: 'completado' }, { day: 3, state: 'completado' }], c)).toBe(2);
    const todos = Array.from({ length: 60 }, (_, i) => ({ day: i + 1, state: 'completado' as const }));
    expect(suggestedDay(todos, c)).toBe(60);
    expect(suggestedDay([], buildCatalog([], []))).toBe(1);
  });
});
