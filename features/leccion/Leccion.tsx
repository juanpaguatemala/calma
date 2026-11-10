'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Hourglass, Quote, Target } from 'lucide-react';
import type { ChallengeState, DayView, Lesson, Usefulness } from '@/types/programa';
import { getDayView, isValidDay } from '@/lib/programa/engine';
import { TOTAL_DAYS } from '@/content/programa/unidades';
import { Enlace } from '@/lib/navegacion/rutas';
import { useDayRecord } from '@/features/datos/hooks';
import { Aviso, Boton, CampoTexto, Cargando, EstadoGuardado, Eyebrow, Tarjeta, btnClass, cx } from '@/components/ui';
import { TarjetaPodcast } from '@/features/podcasts/TarjetaPodcast';
import { Quiz } from './Quiz';

export function Leccion({ day }: { day: number }) {
  if (!isValidDay(day)) {
    return <Aviso tone="error">Ese día no existe en el programa. Elegí un día del 1 al {TOTAL_DAYS}.</Aviso>;
  }
  const view = getDayView(day);
  return (
    <div className="flex flex-col gap-5">
      <Enlace to={{ name: 'programa' }} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-calma-verde">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Programa
      </Enlace>
      {/* key por día: lo pendiente de guardar nunca pasa al día siguiente */}
      {view.kind === 'disponible' ? <LeccionDisponible key={day} view={view} lesson={view.lesson} /> : <EnPreparacion view={view} />}
      <NavDias day={day} />
    </div>
  );
}

function Cabecera({ view, title }: { view: DayView; title: string }) {
  return (
    <header className="flex flex-col gap-1.5">
      <Eyebrow>
        Día {view.day} de {TOTAL_DAYS} · Unidad {view.unit.id}: {view.unit.title}
      </Eyebrow>
      <h1 className="text-balance font-display text-[28px] font-semibold leading-tight text-calma-verde">{title}</h1>
    </header>
  );
}

function Seccion({ id, icon, title, children, tone = 'blanco' }: { id: string; icon?: ReactNode; title: string; children: ReactNode; tone?: 'blanco' | 'salvia' }) {
  return (
    <Tarjeta aria-labelledby={id} className={cx(tone === 'salvia' && 'bg-calma-salvia/15 ring-1 ring-calma-salvia/30')}>
      <h2 id={id} className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-calma-verde">
        {icon}
        {title}
      </h2>
      {children}
    </Tarjeta>
  );
}

const RETO: Array<{ value: ChallengeState; label: string }> = [
  { value: 'practicado', label: 'Lo practiqué' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'omitido', label: 'Lo omito' },
];

function LeccionDisponible({ view, lesson }: { view: DayView; lesson: Lesson }) {
  const { record, error, saveState, update } = useDayRecord(lesson.day);
  if (error) return <Aviso tone="error">{error}</Aviso>;
  if (!record) return <Cargando label="Abriendo la lección…" />;

  const completado = record.state === 'completado';
  const parrafos = lesson.reading.split(/\n\s*\n/);

  return (
    <article className="flex flex-col gap-4">
      <Cabecera view={view} title={lesson.title} />

      {/* A. Título y objetivo */}
      <div className="flex gap-3 rounded-calma bg-calma-verde px-5 py-4 text-white">
        <Target aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-calma-salvia" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">Objetivo de hoy</p>
          <p className="mt-1 text-[15px] leading-relaxed">{lesson.objective}</p>
        </div>
      </div>

      {/* B. Lectura breve */}
      <Seccion id="lectura" icon={<BookOpen aria-hidden className="h-5 w-5" />} title="Lectura breve">
        <div className="flex max-w-prose flex-col gap-3 text-[16px] leading-[1.7] text-calma-tinta">
          {parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Seccion>

      {/* C. Ejemplo cotidiano */}
      <Seccion id="ejemplo" title="Ejemplo cotidiano" tone="salvia">
        <p className="max-w-prose text-[15px] leading-relaxed text-calma-tinta">{lesson.example}</p>
      </Seccion>

      {/* D. Mi reflexión */}
      <Seccion id="reflexion" title="Mi reflexión">
        <CampoTexto
          id={`reflexion-${lesson.day}`}
          label={lesson.reflectionQuestion}
          hint="Privado y opcional. Se guarda solo en este dispositivo."
          value={record.reflection}
          onChange={(v) => update({ reflection: v }, { delay: 600 })}
        />
      </Seccion>

      {/* E. Mi experiencia */}
      <Seccion id="experiencia" title="Mi experiencia">
        {record.experienceSkipped ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-calma-gris">La dejaste para otro momento. Está bien.</p>
            <Boton variant="suave" onClick={() => update({ experienceSkipped: false })}>
              Responder ahora
            </Boton>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <CampoTexto
              id={`experiencia-${lesson.day}`}
              label={lesson.experienceQuestion}
              hint="No hace falta recordar algo doloroso. Una situación pequeña basta."
              value={record.experience}
              onChange={(v) => update({ experience: v }, { delay: 600 })}
            />
            {!record.experience && (
              <button type="button" onClick={() => update({ experienceSkipped: true })} className="self-start text-sm font-semibold text-calma-gris underline-offset-4 hover:underline">
                Omitir por hoy
              </button>
            )}
          </div>
        )}
      </Seccion>

      {/* F. Pequeño quiz */}
      <Seccion id="quiz" title="Pequeño quiz">
        <Quiz
          questions={lesson.quiz}
          answers={record.quizAnswers}
          onAnswer={(qid, oid) => {
            const next = { ...record.quizAnswers };
            if (oid) next[qid] = oid;
            else delete next[qid];
            update({ quizAnswers: next });
          }}
        />
      </Seccion>

      {/* G. Mi reto de hoy */}
      <Seccion id="reto" title="Mi reto de hoy" tone="salvia">
        <p className="max-w-prose text-[16px] font-medium leading-relaxed text-calma-tinta">{lesson.dailyChallenge}</p>
        <div role="radiogroup" aria-label="Estado del reto" className="mt-4 grid grid-cols-3 gap-2">
          {RETO.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={record.challenge === r.value}
              onClick={() => update({ challenge: record.challenge === r.value ? null : r.value })}
              className={cx('min-h-[44px] rounded-2xl px-2 text-sm font-semibold ring-1 transition', record.challenge === r.value ? 'bg-calma-verde text-white ring-calma-verde' : 'bg-white text-calma-verde ring-calma-linea hover:ring-calma-salvia')}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Seccion>

      {view.podcast && (
        <section aria-label="Podcast de este día" className="flex flex-col gap-2">
          <Eyebrow>Podcast de este día</Eyebrow>
          <TarjetaPodcast podcast={view.podcast} />
        </section>
      )}

      {/* H. Mensaje de cierre */}
      <figure className="flex gap-3 px-1 py-2">
        <Quote aria-hidden className="h-6 w-6 shrink-0 text-calma-terracota" />
        <blockquote className="text-balance font-display text-xl font-medium leading-snug text-calma-verde">{lesson.closingMessage}</blockquote>
      </figure>

      {/* I. Autoevaluación */}
      <Seccion id="autoevaluacion" title="Autoevaluación">
        <p id="autoeval-q" className="text-[15px] text-calma-tinta">
          {lesson.selfEvaluation.question}
        </p>
        <div role="radiogroup" aria-labelledby="autoeval-q" className="mt-3 grid grid-cols-5 gap-1.5">
          {lesson.selfEvaluation.options.map((label, i) => {
            const value = (i + 1) as Usefulness;
            const on = record.usefulness === value;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => update({ usefulness: on ? null : value })}
                className={cx('flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center text-[11px] font-semibold leading-tight ring-1 transition sm:text-xs', on ? 'bg-calma-verde text-white ring-calma-verde' : 'bg-white text-calma-verde ring-calma-linea hover:ring-calma-salvia')}
              >
                <span aria-hidden className={cx('h-2.5 rounded-full', on ? 'bg-calma-salvia' : 'bg-calma-salvia/40')} style={{ width: `${8 + i * 5}px` }} />
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-calma-gris">Es solo tu opinión sobre la lección; no es una evaluación de tu persona.</p>
      </Seccion>

      <div className="flex flex-col gap-3 rounded-calma bg-white p-5 ring-1 ring-calma-linea">
        {completado ? (
          <>
            <p className="flex items-center gap-2 font-semibold text-calma-verde">
              <CheckCircle2 aria-hidden className="h-5 w-5" /> Día completado
            </p>
            <p className="text-sm text-calma-gris">Podés volver cuando quieras a repasarlo o editar tus respuestas.</p>
            <Boton variant="secundario" className="self-start" onClick={() => update({ state: 'en-curso' })}>
              Marcar como en curso
            </Boton>
          </>
        ) : (
          <>
            <p className="text-sm text-calma-gris">Cuando sientas que terminaste, marcá el día. No hace falta responder todo.</p>
            <Boton className="self-start" onClick={() => update({ state: 'completado' })}>
              <Check aria-hidden className="h-4 w-4" /> Marcar el día como completado
            </Boton>
          </>
        )}
        <EstadoGuardado state={saveState} />
      </div>
    </article>
  );
}

function EnPreparacion({ view }: { view: DayView }) {
  return (
    <div className="flex flex-col gap-4">
      <Cabecera view={view} title="Contenido en preparación" />
      <Tarjeta className="flex gap-3">
        <Hourglass aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-calma-gris" />
        <p className="text-[15px] leading-relaxed text-calma-tinta">Esta lección todavía se está preparando. Aparecerá aquí cuando esté lista. Mientras tanto, podés repasar los días anteriores o usar SOS Calma si lo necesitás.</p>
      </Tarjeta>
      {view.podcast && <TarjetaPodcast podcast={view.podcast} />}
    </div>
  );
}

function NavDias({ day }: { day: number }) {
  return (
    <nav aria-label="Otros días" className="flex items-center justify-between gap-3 pt-2">
      {day > 1 ? (
        <Enlace to={{ name: 'dia', day: day - 1 }} className={btnClass('suave')}>
          <ArrowLeft aria-hidden className="h-4 w-4" /> Día {day - 1}
        </Enlace>
      ) : (
        <span />
      )}
      {day < TOTAL_DAYS && (
        <Enlace to={{ name: 'dia', day: day + 1 }} className={btnClass('suave')}>
          Día {day + 1} <ArrowRight aria-hidden className="h-4 w-4" />
        </Enlace>
      )}
    </nav>
  );
}
