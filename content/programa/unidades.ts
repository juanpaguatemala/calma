import type { Unit } from '@/types/programa';
import { LECCIONES } from './cargar';

export const TOTAL_DAYS = 60;

const RANGOS: Array<Omit<Unit, 'title'> & { fallback: string }> = [
  { id: 1, firstDay: 1, lastDay: 10, fallback: 'Comprender la ira' },
  { id: 2, firstDay: 11, lastDay: 20, fallback: 'Identificar pensamientos y creencias' },
  { id: 3, firstDay: 21, lastDay: 30, fallback: 'Cuestionar creencias irracionales' },
  { id: 4, firstDay: 31, lastDay: 40, fallback: 'Regular emociones y conductas' },
  { id: 5, firstDay: 41, lastDay: 50, fallback: 'Comunicación, límites y responsabilidad' },
  { id: 6, firstDay: 51, lastDay: 60, fallback: 'Consolidación y prevención' },
];

/** Títulos tomados del contenido entregado; si falta una unidad, el de la especificación. */
export const UNIDADES: Unit[] = RANGOS.map(({ fallback, ...u }) => ({
  ...u,
  title: LECCIONES.find((l) => l.unit === u.id)?.unitTitle ?? fallback,
}));

export const PREGUNTA_AUTOEVALUACION = '¿Qué tan útil te resultó lo aprendido hoy?';
export const ESCALA_UTILIDAD_DEFECTO = ['Nada útil', 'Poco útil', 'Algo útil', 'Bastante útil', 'Muy útil'];
