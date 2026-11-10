'use client';

import { ArrowRight, Headphones, LifeBuoy, NotebookPen } from 'lucide-react';
import { Enlace } from '@/lib/navegacion/rutas';
import { getCatalog, getDayView, suggestedDay } from '@/lib/programa/engine';
import { TOTAL_DAYS } from '@/content/programa/unidades';
import { useAllRecords, usePreferences } from '@/features/datos/hooks';
import { Aviso, Barra, Cargando, Eyebrow, Tarjeta, btnClass, cx } from '@/components/ui';

export function Inicio() {
  const { days, error } = useAllRecords();
  const { prefs } = usePreferences();
  if (!days) return <Cargando />;

  const catalog = getCatalog();
  const completados = days.filter((d) => d.state === 'completado').length;
  const disponibles = catalog.lessons.size;
  const dia = suggestedDay(days, catalog);
  const view = getDayView(dia, catalog);
  const iniciado = days.some((d) => d.day === dia);
  const retosPendientes = days.filter((d) => d.challenge === 'pendiente').length;
  const nombre = prefs?.displayName.trim();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 pt-1">
        <h1 className="text-balance font-display text-[30px] font-semibold leading-tight text-calma-verde">{nombre ? `Hola, ${nombre}` : 'Hola'}</h1>
        <p className="text-[15px] text-calma-gris">Sentir es humano. Aprender a responder es posible.</p>
      </header>

      {error && <Aviso tone="error">{error}</Aviso>}

      <Tarjeta aria-labelledby="dia-actual" className="relative overflow-hidden bg-calma-verde text-white ring-0">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-calma-salvia/25" />
        <div aria-hidden className="pointer-events-none absolute -right-2 top-14 h-20 w-20 rounded-full bg-calma-salvia/20" />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
              Día {dia} de {TOTAL_DAYS} · Unidad {view.unit.id}: {view.unit.title}
            </p>
            <h2 id="dia-actual" className="text-balance font-display text-2xl font-semibold leading-snug">
              {view.kind === 'disponible' ? view.lesson.title : 'Contenido en preparación'}
            </h2>
            {view.kind === 'disponible' && <p className="text-[15px] leading-relaxed text-white/80">{view.lesson.objective}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between text-sm text-white/80">
              <span>Tu progreso</span>
              <span className="tabular-nums">
                {completados} de {TOTAL_DAYS} días
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Días completados" aria-valuemin={0} aria-valuemax={TOTAL_DAYS} aria-valuenow={completados}>
              <div className="h-full rounded-full bg-calma-salvia" style={{ width: `${(completados / TOTAL_DAYS) * 100}%` }} />
            </div>
          </div>
          <Enlace to={{ name: 'dia', day: dia }} className={btnClass('claro', 'self-start')}>
            {iniciado ? 'Continuar mi aprendizaje' : 'Empezar'} <ArrowRight aria-hidden className="h-4 w-4" />
          </Enlace>
        </div>
      </Tarjeta>

      {disponibles === 0 && (
        <Aviso>Las lecciones se están preparando y aparecerán aquí poco a poco. Mientras tanto, SOS Calma y tu plan de seguridad ya están disponibles.</Aviso>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Acceso to={{ name: 'ejercicios' }} Icon={NotebookPen} title="Ejercicios anteriores" text={retosPendientes ? `${retosPendientes} ${retosPendientes === 1 ? 'reto' : 'retos'} para retomar cuando quieras` : 'Tus reflexiones y retos'} />
        <Acceso to={{ name: 'podcasts' }} Icon={Headphones} title="Podcasts" text="15 episodios a lo largo del programa" />
        <Acceso to={{ name: 'sos' }} Icon={LifeBuoy} title="SOS Calma" text="Para un momento difícil" sos />
      </div>

      <Tarjeta>
        <Eyebrow>A tu ritmo</Eyebrow>
        <p className="mt-2 text-[15px] leading-relaxed text-calma-tinta">
          No hace falta seguir los días de corrido. Podés repetir lecciones, volver a tus reflexiones y retomar lo que dejaste pendiente cuando te haga sentido.
        </p>
        <div className="mt-4">
          <Barra value={completados} max={Math.max(disponibles, 1)} label="Días completados entre los disponibles" />
          <p className="mt-1.5 text-xs text-calma-gris tabular-nums">
            {disponibles} {disponibles === 1 ? 'día disponible' : 'días disponibles'} por ahora
          </p>
        </div>
      </Tarjeta>
    </div>
  );
}

function Acceso({ to, Icon, title, text, sos }: { to: Parameters<typeof Enlace>[0]['to']; Icon: typeof LifeBuoy; title: string; text: string; sos?: boolean }) {
  return (
    <Enlace to={to} className={cx('group flex items-start gap-3 rounded-calma p-4 ring-1 transition', sos ? 'bg-calma-terracota/10 ring-calma-terracota/40 hover:bg-calma-terracota/15' : 'bg-white ring-calma-linea hover:ring-calma-salvia')}>
      <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-2xl', sos ? 'bg-calma-terracota text-white' : 'bg-calma-salvia/20 text-calma-verde')}>
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={cx('font-semibold', sos ? 'text-[#8a4f3b]' : 'text-calma-verde')}>{title}</span>
        <span className="text-sm text-calma-gris">{text}</span>
      </span>
    </Enlace>
  );
}
