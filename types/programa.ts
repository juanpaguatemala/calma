/**
 * CALMA — modelos del programa de 60 días.
 * El contenido educativo (lecciones, podcasts) es público y viaja con la app.
 * Los datos privados (respuestas, progreso) viven solo en IndexedDB del dispositivo.
 */

export type UnitId = 1 | 2 | 3 | 4 | 5 | 6;

export interface Unit {
  id: UnitId;
  title: string;
  firstDay: number;
  lastDay: number;
}

export interface QuizOption {
  id: string;
  text: string;
  /** Explicación propia de esta opción (opcional). */
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  /** Opción que mejor refleja lo aprendido. No se califica a la persona. */
  bestOptionId: string;
  /** Explicación educativa general; se muestra sea cual sea la opción elegida. */
  explanation: string;
}

export interface SelfEvaluation {
  question: string;
  /** Exactamente 5 etiquetas, de menos a más útil. */
  options: string[];
}

/**
 * Estado editorial de una lección.
 * - aprobado: se muestra a la persona.
 * - borrador: solo se muestra con NEXT_PUBLIC_CALMA_MOSTRAR_BORRADORES=true, con aviso visible.
 */
export type LessonStatus = 'aprobado' | 'borrador';

export interface Lesson {
  /** Identificador único, p. ej. "dia-01". */
  id: string;
  day: number;
  unit: UnitId;
  unitTitle: string;
  status: LessonStatus;
  title: string;
  objective: string;
  /** Lectura breve, 150 a 220 palabras. Párrafos separados por línea en blanco. */
  reading: string;
  example: string;
  reflectionQuestion: string;
  experienceQuestion: string;
  /** De 1 a 3 preguntas. */
  quiz: QuizQuestion[];
  dailyChallenge: string;
  closingMessage: string;
  selfEvaluation: SelfEvaluation;
  /** Solo en los días 4, 8, 12… 60. */
  podcastId: string | null;
  /** Nota editorial sobre el marco de referencia (no se muestra como cita). */
  sourceFramework?: string;
}

export interface Podcast {
  id: string;
  day: number;
  number: number;
  /**
   * disponible: aprobado para publicar.
   * por-verificar: audio aportado por el responsable; contenido y derechos sin verificar.
   * en-preparacion: sin audio ni guion: se muestra "Próximamente".
   */
  status: 'disponible' | 'por-verificar' | 'en-preparacion';
  title?: string;
  description?: string;
  /** Guion original aprobado. */
  script?: string;
  /** Minutos estimados, 5 a 8. */
  durationMin?: number;
  /** URL o ruta del archivo de audio. Sin él se muestra "Próximamente". */
  audioUrl?: string;
  reflectionQuestion?: string;
}

/** Resultado del motor para un día. */
export type DayView =
  | { kind: 'disponible'; day: number; unit: Unit; lesson: Lesson; podcast: Podcast | null }
  | { kind: 'en-preparacion'; day: number; unit: Unit; podcast: Podcast | null };

/* ---------- Datos privados (IndexedDB) ---------- */

export type DayState = 'no-iniciado' | 'en-curso' | 'completado';
export type ChallengeState = 'pendiente' | 'practicado' | 'omitido';
/** 1 = nada útil … 5 = muy útil. No es una evaluación clínica. */
export type Usefulness = 1 | 2 | 3 | 4 | 5;

export interface DayRecord {
  day: number;
  state: DayState;
  reflection: string;
  experience: string;
  /** El usuario eligió omitir "Mi experiencia". */
  experienceSkipped: boolean;
  /** questionId → optionId elegido. */
  quizAnswers: Record<string, string>;
  challenge: ChallengeState | null;
  usefulness: Usefulness | null;
  firstOpenedAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface PodcastRecord {
  podcastId: string;
  reflection: string;
  listened: boolean;
  updatedAt: number;
}

export interface Preferences {
  key: 'prefs';
  displayName: string;
}

export interface SafetyPlan {
  key: 'plan';
  warningSigns: string;
  calmingSteps: string;
  safePlace: string;
  supportPeople: string;
  professionalHelp: string;
  updatedAt: number;
}

export interface ExportFile {
  app: 'CALMA';
  version: 1;
  exportedAt: string;
  days: DayRecord[];
  podcasts: PodcastRecord[];
  preferences: Preferences | null;
  safetyPlan: SafetyPlan | null;
}

export interface HelpResource {
  id: string;
  nombre: string;
  descripcion: string;
  telefono?: string;
  url?: string;
  /** Sin verificación humana (fecha + responsable) el recurso no se muestra. */
  verificadoEl?: string;
  verificadoPor?: string;
  fuente?: string;
}
