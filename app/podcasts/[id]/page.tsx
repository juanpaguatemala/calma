import { PodcastDetalle } from '@/features/podcasts/Podcasts';
import { PODCASTS } from '@/content/podcasts/episodios';

export const dynamicParams = false;
export function generateStaticParams() { return PODCASTS.map((p) => ({ id: p.id })); }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <PodcastDetalle id={(await params).id} />; }
