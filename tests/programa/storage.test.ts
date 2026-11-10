import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';
import * as db from '@/services/storage/db';

describe('almacenamiento local (IndexedDB)', () => {
  beforeEach(async () => {
    await db.deleteAll();
  });

  it('guarda reflexión, quiz, reto y autoevaluación de un día', async () => {
    await db.saveDay(3, { reflection: 'Noté el enojo antes de hablar.' });
    await db.saveDay(3, { quizAnswers: { q1: 'a' }, challenge: 'practicado', usefulness: 4 });
    const r = await db.getDay(3);
    expect(r).toMatchObject({ day: 3, state: 'en-curso', reflection: 'Noté el enojo antes de hablar.', quizAnswers: { q1: 'a' }, challenge: 'practicado', usefulness: 4 });
  });

  it('completar y volver a "en curso" sin perder respuestas', async () => {
    await db.saveDay(1, { reflection: 'x' });
    const done = await db.saveDay(1, { state: 'completado' });
    expect(done.completedAt).not.toBeNull();
    const again = await db.saveDay(1, { state: 'en-curso' });
    expect(again.completedAt).toBeNull();
    expect(again.reflection).toBe('x');
  });

  it('borra un día sin tocar los demás', async () => {
    await db.saveDay(1, { reflection: 'a' });
    await db.saveDay(2, { reflection: 'b' });
    await db.deleteDay(1);
    expect((await db.listDays()).map((d) => d.day)).toEqual([2]);
  });

  it('exporta todo y luego borra todo', async () => {
    await db.saveDay(5, { experience: 'e' });
    await db.savePodcast('podcast-01', { listened: true, reflection: 'r' });
    await db.savePreferences({ displayName: 'Ana' });
    await db.saveSafetyPlan({ safePlace: 'el patio' });
    const exp = await db.exportAll();
    expect(exp.app).toBe('CALMA');
    expect(exp.days).toHaveLength(1);
    expect(exp.podcasts[0]?.listened).toBe(true);
    expect(exp.preferences?.displayName).toBe('Ana');
    expect(exp.safetyPlan?.safePlace).toBe('el patio');
    await db.deleteAll();
    const vacio = await db.exportAll();
    expect(vacio.days).toEqual([]);
    expect(vacio.podcasts).toEqual([]);
    expect(vacio.preferences).toBeNull();
  });

  it('la base antigua de Habla con Calma solo se borra si se pide', async () => {
    const legacy = new Dexie(db.LEGACY_HABLA_DB);
    legacy.version(1).stores({ hablaMensajes: 'id' });
    await legacy.open();
    legacy.close();
    expect(await db.legacyHablaExists()).toBe(true);
    await db.deleteAll();
    expect(await db.legacyHablaExists()).toBe(true);
    await db.deleteLegacyHabla();
    expect(await db.legacyHablaExists()).toBe(false);
  });
});
