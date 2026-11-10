import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/figtree';
import '@fontsource-variable/outfit';
import { NextShell } from '@/features/shell/NextNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'CALMA',
  description: 'Sentir es humano. Aprender a responder es posible. Programa de 60 días de autorregulación emocional.',
};
export const viewport: Viewport = { themeColor: '#294D40', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-GT">
      <body>
        <NextShell>{children}</NextShell>
      </body>
    </html>
  );
}
