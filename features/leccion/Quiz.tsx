'use client';

import { Lightbulb, RotateCcw } from 'lucide-react';
import type { QuizQuestion } from '@/types/programa';
import { cx } from '@/components/ui';

/**
 * Pequeño quiz sin calificaciones negativas: no hay "incorrecto" ni colores de error.
 * Tras elegir, se muestra la explicación educativa y la opción que mejor refleja lo aprendido.
 */
export function Quiz({ questions, answers, onAnswer }: { questions: QuizQuestion[]; answers: Record<string, string>; onAnswer: (questionId: string, optionId: string | null) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        const answered = Boolean(chosen);
        return (
          <fieldset key={q.id} className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] font-semibold leading-snug text-calma-verde">
              {questions.length > 1 && <span className="mr-1 text-calma-gris tabular-nums">{qi + 1}.</span>}
              {q.prompt}
            </legend>
            <div className="flex flex-col gap-2">
              {q.options.map((o) => {
                const isChosen = chosen === o.id;
                const isBest = q.bestOptionId === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={isChosen}
                    disabled={answered}
                    onClick={() => onAnswer(q.id, o.id)}
                    className={cx(
                      'flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left text-[15px] ring-1 transition disabled:cursor-default',
                      !answered && 'bg-white ring-calma-linea hover:bg-calma-crema hover:ring-calma-salvia',
                      answered && isBest && 'bg-calma-salvia/20 ring-2 ring-calma-salvia',
                      answered && !isBest && isChosen && 'bg-calma-crema ring-calma-verde/30',
                      answered && !isBest && !isChosen && 'bg-white text-calma-gris ring-calma-linea',
                    )}
                  >
                    <span className="text-calma-tinta">{o.text}</span>
                    {answered && (isBest || isChosen) && (
                      <span className="text-xs font-semibold text-calma-verde">
                        {isBest && isChosen ? 'Tu elección · la que mejor refleja lo aprendido' : isBest ? 'La que mejor refleja lo aprendido' : 'Tu elección'}
                      </span>
                    )}
                    {answered && o.explanation && <span className="text-sm leading-relaxed text-calma-gris">{o.explanation}</span>}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="flex flex-col gap-3 rounded-2xl bg-calma-crema px-4 py-3" aria-live="polite">
                <p className="flex gap-2 text-sm leading-relaxed text-calma-tinta">
                  <Lightbulb aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-calma-verde" />
                  <span>{q.explanation}</span>
                </p>
                <button type="button" onClick={() => onAnswer(q.id, null)} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-calma-verde underline-offset-4 hover:underline">
                  <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Volver a intentarlo
                </button>
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
