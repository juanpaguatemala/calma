'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { NavProvider, pathFor, rutaFromPath, type Ruta } from '@/lib/navegacion/rutas';
import { AppShell } from './AppShell';

function Link({ to, children, ...rest }: { to: Ruta; children: ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <NextLink href={pathFor(to)} {...rest}>
      {children}
    </NextLink>
  );
}

/** Conecta la navegación de CALMA con el App Router de Next.js. */
export function NextShell({ children }: { children: ReactNode }) {
  const current = rutaFromPath(usePathname() ?? '/');
  return (
    <NavProvider value={{ current, Link }}>
      <AppShell>{children}</AppShell>
    </NavProvider>
  );
}
