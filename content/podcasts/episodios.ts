/**
 * Biblioteca de 15 podcasts (días 4, 8, 12 … 60), cargada desde calma-60-dias.json.
 * Estados:
 *  - disponible: aprobado para publicar.
 *  - por-verificar: audio aportado por el responsable; contenido y derechos sin verificar.
 *  - en-preparacion: sin audio: se muestra "Próximamente" (y el guion, si existe).
 */
export { PODCASTS } from '@/content/programa/cargar';

export const DIAS_PODCAST = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60] as const;

export const podcastIdForDay = (day: number): string | null =>
  (DIAS_PODCAST as readonly number[]).includes(day) ? `podcast-${String(day / 4).padStart(2, '0')}` : null;
