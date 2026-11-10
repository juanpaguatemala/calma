import { Leccion } from '@/features/leccion/Leccion';
import { allDays } from '@/lib/programa/engine';

export const dynamicParams = false;
export function generateStaticParams() { return allDays().map((d) => ({ dia: String(d) })); }
export async function generateMetadata({ params }: { params: Promise<{ dia: string }> }) { return { title: `Día ${(await params).dia} · CALMA` }; }
export default async function Page({ params }: { params: Promise<{ dia: string }> }) { return <Leccion day={Number((await params).dia)} />; }
