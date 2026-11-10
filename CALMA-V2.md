# CALMA v2 — Programa de 60 días (sin IA)

> Sentir es humano. Aprender a responder es posible.

Aplicación educativa, privada, gratuita y local-first. Sin inteligencia artificial, sin cuentas, sin servidores para datos personales.

## Qué cambió

**Se retiró** el módulo "Habla con Calma" completo: `features/habla-con-calma/`, `lib/calma-ai/`, `lib/safety/`, `content/habla/`, `services/habla/`, `app/api/calma/`, `app/habla/`, `types/habla.ts`, `tests/habla/` y la dependencia `server-only`. Si en tu repo existen, bórralos. En los dispositivos donde alguien lo usó queda la base local `calma-habla`: no se borra sola; Configuración ofrece borrarla con confirmación.

**Se agregó:**

| Carpeta | Contenido |
| --- | --- |
| `content/programa/calma-60-dias.json` | Tu contenido, tal como lo entregaste (fuente única) |
| `content/programa/cargar.ts` | Convierte el JSON a modelos tipados |
| `content/programa/unidades.ts` | 6 unidades de 10 días |
| `content/podcasts/episodios.ts` | 15 episodios (días 4, 8 … 60) |
| `content/recursos-ayuda.ts` | Directorio de ayuda; teléfonos **por verificar** |
| `lib/programa/engine.ts` | Motor: validación, catálogo, vista de cada día, día sugerido, informe editorial |
| `lib/navegacion/rutas.tsx` | Rutas de los 7 módulos, independientes del enrutador (Next, Capacitor) |
| `services/storage/db.ts` | IndexedDB (Dexie): progreso, respuestas, retos, autoevaluaciones, podcasts, preferencias, plan de seguridad; exportar y borrar |
| `features/` | Inicio, Programa, Lección (A–I), Quiz, Ejercicios, Podcasts y reproductor, Avances, SOS, Configuración, navegación |
| `app/` | Rutas del App Router; todas se generan estáticas |
| `tests/programa/` | 76 pruebas |
| `tailwind.calma-preset.ts` | Colores y fuentes de CALMA (`calma-salvia`, `calma-verde`, …) |

## Navegación

En el teléfono: barra inferior con Inicio, Programa, **SOS** (al centro), Ejercicios y Avances; Podcasts y Configuración arriba a la derecha. En tablet y escritorio: barra lateral con los 7 módulos.

## Cómo probarlo

```bash
npm install
npm test           # 76 pruebas: 60 lecciones validadas, motor y almacenamiento
npm run typecheck  # TypeScript estricto
npm run dev        # http://localhost:3000
```

Recorrido sugerido: Inicio → Empezar → escribir una reflexión → responder el quiz → marcar el reto → autoevaluación → Marcar el día como completado → recargar la página (todo sigue ahí) → Ejercicios (filtro "Retos pendientes") → Podcasts → Avances → SOS (respiración, pausa, plan de seguridad) → Configuración (exportar, borrar todo).

## Cómo actualizar el contenido

1. Edita `content/programa/calma-60-dias.json` (mismo formato).
2. `npm test`. Si una lección no cumple la estructura (lectura de 150–220 palabras, 1–3 preguntas, 5 opciones de autoevaluación, podcast en el día correcto…), la prueba dice qué falta y la app la muestra como "Contenido en preparación" en lugar de romperse.
3. Opcional por pregunta: `optionExplanations: ["…", "…", "…"]` agrega una explicación propia a cada opción del quiz.
4. Opcional por lección: `"status": "borrador"` la oculta.
5. Podcasts: `status` `approved` = disponible, `provided_unverified` = se reproduce con aviso de verificación pendiente, `pending` = "Próximamente". Se pueden agregar `script` (guion) y `durationMin` (5–8).

## Desplegar

- **GitHub + Vercel:** `git push` e importar en Vercel. No requiere variables de entorno.
- **Capacitor / Android Studio:** todas las rutas son estáticas; añade `output: 'export'` en `next.config` y usa la carpeta `out/` como `webDir`.
- Fuentes empaquetadas con `@fontsource-variable` (funcionan sin conexión).

## Pendiente

- **Contenido (revisión editorial):** ver el informe de la entrega.
- Verificar derechos y contenido de los 12 audios aportados; episodios 13–15 sin audio.
- Verificar teléfonos y recursos de ayuda (`content/recursos-ayuda.ts`).
- Integrar con tu SOS y Configuración existentes (aquí van versiones de referencia).
- PWA: manifiesto y caché sin conexión (no se tocó lo que ya tengas).
