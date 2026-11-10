'use client';

import { useEffect, useState } from 'react';
import { Download, HardDrive, Trash2 } from 'lucide-react';
import { usePreferences } from '@/features/datos/hooks';
import * as db from '@/services/storage/db';
import { CONTENT_DISCLAIMER, CONTENT_VERSION } from '@/content/programa/cargar';
import { Aviso, Boton, Cargando, Confirmar, EstadoGuardado, Tarjeta, TituloPagina } from '@/components/ui';

const SE_GUARDA = [
  'Tu progreso en el programa (días en curso y completados).',
  'Tus reflexiones y experiencias escritas.',
  'Tus respuestas a los quizzes.',
  'El estado de tus retos y tus autoevaluaciones.',
  'Tus reflexiones sobre los podcasts y cuáles escuchaste.',
  'Tu plan personal de seguridad y tu nombre para el saludo.',
];

export function Configuracion() {
  const { prefs, saveState, update } = usePreferences();
  const [mensaje, setMensaje] = useState<{ tone: 'info' | 'error'; text: string } | null>(null);
  const [legacy, setLegacy] = useState(false);

  useEffect(() => {
    void db.legacyHablaExists().then(setLegacy);
  }, []);

  const exportar = async () => {
    try {
      const data = await db.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calma-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMensaje({ tone: 'info', text: `Se preparó el archivo con ${data.days.length} ${data.days.length === 1 ? 'día' : 'días'} de registros.` });
    } catch {
      setMensaje({ tone: 'error', text: 'No se pudo exportar. Intentá de nuevo.' });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <TituloPagina eyebrow="Configuración y privacidad" title="Tus datos, en tu dispositivo" intro="CALMA funciona sin cuenta. Todo lo que escribís se guarda solo en este navegador y no se envía a ningún servidor." />

      <Tarjeta aria-labelledby="cfg-nombre">
        <h2 id="cfg-nombre" className="font-display text-lg font-semibold text-calma-verde">
          Saludo
        </h2>
        {!prefs ? (
          <Cargando />
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <label htmlFor="cfg-nombre-input" className="text-sm font-semibold text-calma-verde">
              ¿Cómo querés que te saludemos? (opcional)
            </label>
            <input
              id="cfg-nombre-input"
              value={prefs.displayName}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => update({ displayName: e.target.value }, { delay: 500 })}
              className="min-h-[44px] rounded-2xl bg-calma-crema/60 px-4 text-[15px] outline-none ring-1 ring-calma-linea focus:bg-white focus:ring-2 focus:ring-calma-salvia"
            />
            <EstadoGuardado state={saveState} />
          </div>
        )}
      </Tarjeta>

      <Tarjeta aria-labelledby="cfg-guarda">
        <h2 id="cfg-guarda" className="flex items-center gap-2 font-display text-lg font-semibold text-calma-verde">
          <HardDrive aria-hidden className="h-5 w-5" /> Qué se guarda
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-calma-tinta">
          {SE_GUARDA.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-calma-gris">
          Se guarda en el almacenamiento local del navegador (IndexedDB). <strong className="font-semibold text-calma-tinta">No está cifrado:</strong> cualquier persona que use este dispositivo con tu sesión podría verlo. Si borrás los datos del navegador, también se borran.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-calma-gris">No hay cuentas, acceso de pareja, supervisión remota ni analítica.</p>
      </Tarjeta>

      <Tarjeta aria-labelledby="cfg-exportar" className="flex flex-col gap-3">
        <h2 id="cfg-exportar" className="font-display text-lg font-semibold text-calma-verde">
          Exportar mis datos
        </h2>
        <p className="text-sm text-calma-gris">Descargá un archivo con todo lo que guardaste, para conservarlo o llevarlo a otro dispositivo.</p>
        <Boton variant="secundario" className="self-start" onClick={exportar}>
          <Download aria-hidden className="h-4 w-4" /> Exportar (.json)
        </Boton>
      </Tarjeta>

      <Tarjeta aria-labelledby="cfg-borrar" className="flex flex-col gap-3">
        <h2 id="cfg-borrar" className="font-display text-lg font-semibold text-calma-verde">
          Borrar datos
        </h2>
        <p className="text-sm text-calma-gris">Para borrar un solo día, usá el botón Borrar en Ejercicios y reflexiones.</p>
        <Confirmar
          trigger={
            <>
              <Trash2 aria-hidden className="h-4 w-4" /> Borrar todos mis datos
            </>
          }
          question="¿Borrar todo lo que guardaste en CALMA en este dispositivo? No se puede deshacer. Si querés conservarlo, exportalo primero."
          confirmLabel="Sí, borrar todo"
          onConfirm={async () => {
            try {
              await db.deleteAll();
              setMensaje({ tone: 'info', text: 'Se borraron todos tus datos de este dispositivo.' });
            } catch {
              setMensaje({ tone: 'error', text: 'No se pudieron borrar los datos. Intentá de nuevo.' });
            }
          }}
        />
        {legacy && (
          <div className="flex flex-col gap-2 border-t border-calma-linea pt-3">
            <p className="text-sm text-calma-tinta">En este dispositivo quedan conversaciones del antiguo asistente "Habla con Calma", que ya no forma parte de la app.</p>
            <Confirmar
              variant="suave"
              trigger="Borrar esas conversaciones"
              question="¿Borrar las conversaciones guardadas del antiguo asistente? No se puede deshacer."
              confirmLabel="Borrar conversaciones"
              onConfirm={async () => {
                await db.deleteLegacyHabla();
                setLegacy(false);
                setMensaje({ tone: 'info', text: 'Se borraron las conversaciones del antiguo asistente.' });
              }}
            />
          </div>
        )}
      </Tarjeta>

      {mensaje && <Aviso tone={mensaje.tone}>{mensaje.text}</Aviso>}

      <p className="px-1 text-xs leading-relaxed text-calma-gris">
        {CONTENT_DISCLAIMER} · Contenido versión {CONTENT_VERSION}.
      </p>
    </div>
  );
}
