'use client';

import { getCatalog } from '@/lib/programa/engine';
import { TOTAL_DAYS, UNIDADES } from '@/content/programa/unidades';
import { useAllRecords } from '@/features/datos/hooks';
import { Aviso, Barra, Cargando, Tarjeta, TituloPagina } from '@/components/ui';

/** Estadísticas descriptivas de actividad. No mide bienestar ni hace interpretaciones clínicas. */
export function Avances() {
  const { days, podcasts, error } = useAllRecords();
  if (!days || !podcasts) return <Cargando />;

  const completados = days.filter((d) => d.state === 'completado');
  const enCurso = days.filter((d) => d.state === 'en-curso');
  const reflexiones = days.filter((d) => d.reflection.trim()).length;
  const experiencias = days.filter((d) => d.experience.trim()).length;
  const quizzes = days.reduce((n, d) => n + Object.keys(d.quizAnswers).length, 0);
  const retos = { practicado: 0, pendiente: 0, omitido: 0 };
  days.forEach((d) => d.challenge && (retos[d.challenge] += 1));
  const escuchados = podcasts.filter((p) => p.listened).length;
  const utilidad = [1, 2, 3, 4, 5].map((v) => days.filter((d) => d.usefulness === v).length);
  const etiquetas = getCatalog().lessons.get(1)?.selfEvaluation.options ?? ['Nada útil', 'Poco útil', 'Algo útil', 'Bastante útil', 'Muy útil'];
  const maxU = Math.max(1, ...utilidad);

  const cifras: Array<[string, number]> = [
    ['Días completados', completados.length],
    ['Días en curso', enCurso.length],
    ['Reflexiones escritas', reflexiones],
    ['Experiencias compartidas', experiencias],
    ['Preguntas de quiz respondidas', quizzes],
    ['Podcasts escuchados', escuchados],
  ];

  return (
    <div className="flex flex-col gap-5">
      <TituloPagina eyebrow="Mis avances" title="Lo que llevás recorrido" intro="Estos números describen tu actividad en la app. No miden cómo estás ni reemplazan tu propia mirada." />
      {error && <Aviso tone="error">{error}</Aviso>}

      <Tarjeta>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-calma-verde">Programa</h2>
          <span className="text-sm text-calma-gris tabular-nums">
            {completados.length} de {TOTAL_DAYS}
          </span>
        </div>
        <div className="mt-3">
          <Barra value={completados.length} max={TOTAL_DAYS} label="Días completados" />
        </div>
        <ul className="mt-5 flex flex-col gap-3">
          {UNIDADES.map((u) => {
            const total = u.lastDay - u.firstDay + 1;
            const hechos = completados.filter((d) => d.day >= u.firstDay && d.day <= u.lastDay).length;
            return (
              <li key={u.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-calma-tinta">
                    <span className="text-calma-gris">Unidad {u.id} · </span>
                    {u.title}
                  </span>
                  <span className="shrink-0 text-calma-gris tabular-nums">
                    {hechos}/{total}
                  </span>
                </div>
                <Barra value={hechos} max={total} label={`Unidad ${u.id}`} />
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cifras.map(([label, n]) => (
          <div key={label} className="flex flex-col gap-1 rounded-calma bg-white p-4 ring-1 ring-calma-linea">
            <dt className="text-xs text-calma-gris">{label}</dt>
            <dd className="font-display text-2xl font-semibold text-calma-verde tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <Tarjeta>
        <h2 className="font-display text-lg font-semibold text-calma-verde">Retos de cada día</h2>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(
            [
              ['Practicados', retos.practicado],
              ['Pendientes', retos.pendiente],
              ['Omitidos', retos.omitido],
            ] as const
          ).map(([l, n]) => (
            <div key={l} className="rounded-2xl bg-calma-crema px-2 py-3">
              <dd className="font-display text-xl font-semibold text-calma-verde tabular-nums">{n}</dd>
              <dt className="text-xs text-calma-gris">{l}</dt>
            </div>
          ))}
        </dl>
      </Tarjeta>

      <Tarjeta>
        <h2 className="font-display text-lg font-semibold text-calma-verde">¿Qué tan útiles te resultaron las lecciones?</h2>
        <p className="mt-1 text-xs text-calma-gris">Cantidad de días con cada respuesta. Es tu opinión sobre el contenido, no una evaluación personal.</p>
        <ul className="mt-4 flex flex-col gap-2">
          {utilidad.map((n, i) => (
            <li key={i} className="grid grid-cols-[104px_1fr_28px] items-center gap-3 text-sm">
              <span className="text-calma-tinta">{etiquetas[i]}</span>
              <span className="h-3 overflow-hidden rounded-full bg-calma-crema">
                <span className="block h-full rounded-full bg-calma-salvia" style={{ width: `${(n / maxU) * 100}%` }} />
              </span>
              <span className="text-right text-calma-gris tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  );
}
