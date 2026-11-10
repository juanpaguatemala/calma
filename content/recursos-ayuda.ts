/**
 * Directorio configurable de recursos de ayuda.
 *
 * REGLA: ningún teléfono se escribe de memoria. Cada recurso debe tener
 * `verificadoEl` y `verificadoPor` llenados por una persona responsable tras
 * confirmarlo en una fuente oficial. Los recursos sin verificación NO se muestran
 * y la interfaz usa el texto genérico "llama al número de emergencias de tu país".
 */
import type { HelpResource } from '@/types/programa';

export const RECURSOS_AYUDA: HelpResource[] = [
  {
    id: 'emergencias',
    nombre: 'Emergencias',
    descripcion: 'Si alguien está en peligro inmediato.',
    telefono: undefined, // POR VERIFICAR con fuente oficial
    fuente: undefined,
  },
  {
    id: 'apoyo-emocional',
    nombre: 'Línea de apoyo emocional',
    descripcion: 'Para hablar con una persona cuando el malestar es muy fuerte.',
    telefono: undefined, // POR VERIFICAR
  },
  {
    id: 'violencia',
    nombre: 'Atención a violencia en el hogar',
    descripcion: 'Orientación y protección si alguien te hace daño o te amenaza.',
    telefono: undefined, // POR VERIFICAR
  },
];

export function recursosVerificados(): HelpResource[] {
  return RECURSOS_AYUDA.filter((r) => Boolean(r.verificadoEl && r.verificadoPor && (r.telefono || r.url)));
}

export function textoEmergencias(): string {
  const emerg = recursosVerificados().find((r) => r.id === 'emergencias');
  return emerg?.telefono
    ? `llama a emergencias al ${emerg.telefono}`
    : 'llama al número de emergencias de tu país';
}
