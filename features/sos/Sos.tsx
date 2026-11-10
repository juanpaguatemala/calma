'use client';

import { useEffect, useRef, useState } from 'react';
import { DoorOpen, Phone, Timer, Users, Wind } from 'lucide-react';
import { recursosVerificados } from '@/content/recursos-ayuda';
import { useSafetyPlan } from '@/features/datos/hooks';
import { Boton, CampoTexto, Cargando, EstadoGuardado, Tarjeta, cx } from '@/components/ui';

/**
 * SOS Calma (versión de referencia). Si el proyecto ya tiene su SOS, se conserva el suyo.
 * No evalúa riesgo ni promete detener una crisis: orienta a la seguridad y a la ayuda humana.
 */
export function Sos() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 rounded-calma bg-calma-verde px-5 py-6 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">SOS Calma</p>
        <h1 className="text-balance font-display text-[28px] font-semibold leading-tight">Estás aquí, y eso ya es un paso.</h1>
        <p className="max-w-prose text-[15px] leading-relaxed text-white/85">Lo que sentís ahora va a bajar. No tenés que resolver nada en este momento: primero, cuidarte.</p>
      </header>

      <Peligro />
      <Pausa />
      <Respiracion />
      <Presente />
      <Alejarme />
      <PlanSeguridad />
      <p className="px-1 text-xs leading-relaxed text-calma-gris">CALMA es educativa y de autoayuda. No puede evaluar ni detener una crisis y no reemplaza la atención profesional.</p>
    </div>
  );
}

function Peligro() {
  const recursos = recursosVerificados();
  return (
    <section aria-labelledby="sos-peligro" className="rounded-calma bg-calma-terracota/10 p-5 ring-1 ring-calma-terracota/40">
      <h2 id="sos-peligro" className="font-display text-lg font-semibold text-[#7e4634]">
        Si alguien corre peligro ahora
      </h2>
      <ul className="mt-3 flex flex-col gap-2 text-[15px] text-calma-tinta">
        <li className="flex gap-2">
          <DoorOpen aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5a43]" /> Alejate del lugar y de la persona. No es momento de confrontar a nadie.
        </li>
        {recursos.length ? (
          recursos.map((r) => (
            <li key={r.id} className="flex gap-2">
              <Phone aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5a43]" />
              <span>
                {r.nombre}: <strong className="select-all tabular-nums">{r.telefono}</strong>
              </span>
            </li>
          ))
        ) : (
          <li className="flex gap-2">
            <Phone aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5a43]" /> Llamá al número de emergencias de tu país.
          </li>
        )}
        <li className="flex gap-2">
          <Users aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5a43]" /> Buscá o escribile a una persona de confianza.
        </li>
      </ul>
    </section>
  );
}

function Pausa() {
  return (
    <Tarjeta aria-labelledby="sos-pausa">
      <h2 id="sos-pausa" className="font-display text-lg font-semibold text-calma-verde">
        Una pausa breve
      </h2>
      <ol className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-calma-tinta">
        {['Dejá de hablar y de escribir por un momento.', 'Soltá lo que tengas en las manos.', 'Apoyá los pies en el suelo y aflojá los hombros.', 'Decite por dentro: "Puedo esperar antes de responder".'].map((t, i) => (
          <li key={t} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-calma-salvia/25 text-xs font-semibold text-calma-verde tabular-nums">{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

const INHALA = 4;
const EXHALA = 6;

function Respiracion() {
  const [activa, setActiva] = useState(false);
  const [fase, setFase] = useState<'inhala' | 'exhala'>('inhala');
  const [ciclos, setCiclos] = useState(0);
  useEffect(() => {
    if (!activa) return;
    const t = setTimeout(
      () => {
        if (fase === 'inhala') setFase('exhala');
        else {
          setFase('inhala');
          setCiclos((c) => c + 1);
        }
      },
      (fase === 'inhala' ? INHALA : EXHALA) * 1000,
    );
    return () => clearTimeout(t);
  }, [activa, fase]);

  return (
    <Tarjeta aria-labelledby="sos-respira">
      <h2 id="sos-respira" className="flex items-center gap-2 font-display text-lg font-semibold text-calma-verde">
        <Wind aria-hidden className="h-5 w-5" /> Respiración guiada
      </h2>
      <p className="mt-1 text-sm text-calma-gris">Opcional. Inhalá en {INHALA} tiempos y soltá el aire en {EXHALA}. Si te incomoda, detenete.</p>
      <div className="mt-5 flex flex-col items-center gap-4">
        <div className="grid h-44 w-44 place-items-center">
          <div
            aria-hidden
            className="rounded-full bg-calma-salvia/40 ring-8 ring-calma-salvia/15 motion-reduce:!transition-none"
            style={{
              width: activa && fase === 'inhala' ? 168 : 88,
              height: activa && fase === 'inhala' ? 168 : 88,
              transition: `width ${fase === 'inhala' ? INHALA : EXHALA}s ease-in-out, height ${fase === 'inhala' ? INHALA : EXHALA}s ease-in-out`,
            }}
          />
        </div>
        <p aria-live="polite" className="font-display text-xl font-medium text-calma-verde">
          {activa ? (fase === 'inhala' ? 'Inhalá…' : 'Soltá el aire…') : 'Cuando quieras'}
        </p>
        {ciclos > 0 && <p className="text-xs text-calma-gris tabular-nums">{ciclos} {ciclos === 1 ? 'respiración' : 'respiraciones'}</p>}
        <Boton
          variant={activa ? 'secundario' : 'primario'}
          onClick={() => {
            setActiva((a) => !a);
            setFase('inhala');
            if (activa) setCiclos(0);
          }}
        >
          {activa ? 'Detener' : 'Empezar'}
        </Boton>
      </div>
    </Tarjeta>
  );
}

const PASOS_PRESENTE = ['Nombrá 5 cosas que ves.', 'Notá 4 cosas que podés tocar.', 'Escuchá 3 sonidos a tu alrededor.', 'Identificá 2 olores, o dos cosas que te gustan de este lugar.', 'Notá 1 sabor, o tomá un sorbo de agua.'];

function Presente() {
  const [paso, setPaso] = useState(0);
  const fin = paso >= PASOS_PRESENTE.length;
  return (
    <Tarjeta aria-labelledby="sos-presente">
      <h2 id="sos-presente" className="font-display text-lg font-semibold text-calma-verde">
        Volver al presente
      </h2>
      <p aria-live="polite" className="mt-3 min-h-[3rem] font-display text-xl font-medium leading-snug text-calma-tinta">
        {fin ? 'Bien. Ya estás un poco más aquí.' : PASOS_PRESENTE[paso]}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex gap-1.5" aria-hidden>
          {PASOS_PRESENTE.map((_, i) => (
            <span key={i} className={cx('h-1.5 w-6 rounded-full', i < paso ? 'bg-calma-verde' : 'bg-calma-crema')} />
          ))}
        </div>
        <Boton variant="suave" className="ml-auto" onClick={() => setPaso((p) => (fin ? 0 : p + 1))}>
          {fin ? 'Repetir' : 'Listo, siguiente'}
        </Boton>
      </div>
    </Tarjeta>
  );
}

const MINUTOS = [5, 10, 20, 30];

function Alejarme() {
  const [min, setMin] = useState(10);
  const [fin, setFin] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (fin === null) return;
    tick.current = setInterval(() => setAhora(Date.now()), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [fin]);
  const restante = fin === null ? 0 : Math.max(0, Math.round((fin - ahora) / 1000));
  const terminado = fin !== null && restante === 0;

  return (
    <Tarjeta aria-labelledby="sos-alejarme">
      <h2 id="sos-alejarme" className="flex items-center gap-2 font-display text-lg font-semibold text-calma-verde">
        <Timer aria-hidden className="h-5 w-5" /> Tomar distancia de una discusión
      </h2>
      <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-calma-tinta">
        <li>Decí algo breve y sin culpar: "Necesito una pausa. Lo hablamos después".</li>
        <li>Salí a un lugar tranquilo y seguro; no manejes si estás muy alterado.</li>
        <li>Durante la pausa, evitá repasar la discusión en tu cabeza. Respirá, caminá, tomá agua.</li>
      </ul>
      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-calma-crema p-4">
        {fin === null ? (
          <>
            <p className="text-sm font-semibold text-calma-verde">Temporizador de pausa</p>
            <div role="radiogroup" aria-label="Duración de la pausa" className="flex flex-wrap gap-2">
              {MINUTOS.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={min === m} onClick={() => setMin(m)} className={cx('min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 tabular-nums', min === m ? 'bg-calma-verde text-white ring-calma-verde' : 'bg-white text-calma-verde ring-calma-linea')}>
                  {m} min
                </button>
              ))}
            </div>
            <Boton
              className="self-start"
              onClick={() => {
                setAhora(Date.now());
                setFin(Date.now() + min * 60_000);
              }}
            >
              Empezar pausa
            </Boton>
          </>
        ) : (
          <>
            <p aria-live="polite" className="font-display text-4xl font-semibold text-calma-verde tabular-nums">
              {String(Math.floor(restante / 60)).padStart(2, '0')}:{String(restante % 60).padStart(2, '0')}
            </p>
            <p className="text-sm leading-relaxed text-calma-tinta">
              {terminado ? 'La pausa terminó. ' : ''}Volvé a la conversación solo si te sentís en calma y hay seguridad para todas las personas. Si no, está bien tomar más tiempo.
            </p>
            <Boton variant="secundario" className="self-start" onClick={() => setFin(null)}>
              {terminado ? 'Listo' : 'Terminar pausa'}
            </Boton>
          </>
        )}
      </div>
    </Tarjeta>
  );
}

const CAMPOS_PLAN = [
  { key: 'warningSigns', label: 'Mis señales de alerta', hint: 'Lo que noto en mi cuerpo, mis pensamientos o mi voz cuando el enojo sube.' },
  { key: 'calmingSteps', label: 'Lo que me ayuda a bajar la intensidad', hint: 'Acciones concretas y seguras.' },
  { key: 'safePlace', label: 'Un lugar seguro al que puedo ir', hint: '' },
  { key: 'supportPeople', label: 'Personas a quienes puedo llamar o escribir', hint: 'Nombre y cómo contactarlas.' },
  { key: 'professionalHelp', label: 'Apoyo profesional o servicios de emergencia', hint: 'Números o lugares que verifiqué yo.' },
] as const;

function PlanSeguridad() {
  const { plan, saveState, update } = useSafetyPlan();
  return (
    <Tarjeta aria-labelledby="sos-plan">
      <h2 id="sos-plan" className="font-display text-lg font-semibold text-calma-verde">
        Mi plan personal de seguridad
      </h2>
      <p className="mt-1 text-sm text-calma-gris">Escribilo en un momento tranquilo para tenerlo a mano en uno difícil. Se guarda solo en este dispositivo.</p>
      {!plan ? (
        <Cargando />
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {CAMPOS_PLAN.map((c) => (
            <CampoTexto key={c.key} id={`plan-${c.key}`} label={c.label} hint={c.hint || undefined} rows={3} value={plan[c.key]} onChange={(v) => update({ [c.key]: v }, { delay: 600 })} />
          ))}
          <EstadoGuardado state={saveState} />
        </div>
      )}
    </Tarjeta>
  );
}
