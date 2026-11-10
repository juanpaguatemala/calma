/**
 * Carga el contenido del programa desde `calma-60-dias.json` (archivo entregado por
 * el responsable del proyecto) y lo convierte a los modelos tipados de la app.
 * El JSON no se modifica: para cambiar una lección, se edita el JSON y se corre `npm test`.
 */
import type { Lesson, Podcast, QuizQuestion, UnitId } from '@/types/programa';
import data from './calma-60-dias.json';

interface RawQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Opcional: una explicación por opción, en el mismo orden que `options`. */
  optionExplanations?: string[];
}

interface RawLesson {
  day: number;
  unit: number;
  unitTitle: string;
  title: string;
  objective: string;
  reading: string;
  example: string;
  reflectionQuestion: string;
  experienceQuestion: string;
  quiz: RawQuiz[];
  dailyChallenge: string;
  closingMessage: string;
  selfEvaluation: { question: string; options: string[] };
  podcastId: string | null;
  sourceFramework?: string;
  /** Opcional: "borrador" oculta la lección. Por defecto se considera aprobada. */
  status?: string;
}

interface RawPodcast {
  id: string;
  day: number;
  title?: string;
  description?: string;
  audioUrl?: string | null;
  script?: string;
  durationMin?: number;
  status: string;
}

interface RawFile {
  app: string;
  version: string;
  language?: string;
  disclaimer?: string;
  lessons: RawLesson[];
  podcasts: RawPodcast[];
}

const raw = data as RawFile;
const LETTERS = 'abcdefgh';

function toQuiz(q: RawQuiz, i: number): QuizQuestion {
  const options = q.options.map((text, j) => ({ id: LETTERS[j] ?? String(j), text, explanation: q.optionExplanations?.[j] }));
  return {
    id: `q${i + 1}`,
    prompt: q.question,
    options,
    bestOptionId: options[q.correctIndex]?.id ?? '',
    explanation: q.explanation,
  };
}

export function toLesson(l: RawLesson): Lesson {
  return {
    id: `dia-${String(l.day).padStart(2, '0')}`,
    day: l.day,
    unit: l.unit as UnitId,
    unitTitle: l.unitTitle,
    status: l.status === 'borrador' ? 'borrador' : 'aprobado',
    title: l.title,
    objective: l.objective,
    reading: l.reading,
    example: l.example,
    reflectionQuestion: l.reflectionQuestion,
    experienceQuestion: l.experienceQuestion,
    quiz: l.quiz.map(toQuiz),
    dailyChallenge: l.dailyChallenge,
    closingMessage: l.closingMessage,
    selfEvaluation: l.selfEvaluation,
    podcastId: l.podcastId,
    sourceFramework: l.sourceFramework,
  };
}

const PODCAST_STATUS: Record<string, Podcast['status']> = {
  approved: 'disponible',
  aprobado: 'disponible',
  disponible: 'disponible',
  provided_unverified: 'por-verificar',
  pending: 'en-preparacion',
};

export function toPodcast(p: RawPodcast, index: number): Podcast {
  const status = PODCAST_STATUS[p.status] ?? 'en-preparacion';
  return {
    id: p.id,
    day: p.day,
    number: index + 1,
    status,
    title: p.title,
    description: p.description,
    script: p.script,
    durationMin: p.durationMin,
    audioUrl: p.audioUrl ?? undefined,
  };
}

export const CONTENT_VERSION = raw.version;
export const CONTENT_DISCLAIMER = raw.disclaimer ?? '';
export const LECCIONES: Lesson[] = raw.lessons.map(toLesson);
export const PODCASTS: Podcast[] = raw.podcasts.map(toPodcast);
