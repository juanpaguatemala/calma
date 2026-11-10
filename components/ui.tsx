'use client';

import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Check, CloudOff, Loader2 } from 'lucide-react';
import type { SaveState } from '@/features/datos/hooks';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export function Tarjeta({ children, className, as: As = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article'; 'aria-labelledby'?: string; 'aria-label'?: string }) {
  return (
    // El fondo y el borde por defecto solo se aplican si quien llama no define los suyos
    // (en Tailwind, dos clases de fondo en el mismo elemento no se sobrescriben por orden).
    <As
      className={cx(
        'rounded-calma p-5 shadow-[0_1px_2px_rgba(41,77,64,0.06)]',
        !/(^|\s)bg-/.test(className ?? '') && 'bg-white',
        !/(^|\s)ring-/.test(className ?? '') && 'ring-1 ring-calma-linea',
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-[11px] font-semibold uppercase tracking-[0.08em] text-calma-gris', className)}>{children}</p>;
}

type BtnVariant = 'primario' | 'secundario' | 'suave' | 'sos' | 'claro';
const BTN: Record<BtnVariant, string> = {
  primario: 'bg-calma-verde text-white hover:bg-[#21402f]',
  secundario: 'bg-white text-calma-verde ring-1 ring-calma-verde/25 hover:bg-calma-crema',
  suave: 'bg-calma-crema text-calma-verde hover:bg-calma-salvia/25',
  sos: 'bg-calma-terracota text-white hover:bg-[#b97a64]',
  /** Sobre fondos oscuros. */
  claro: 'bg-white text-calma-verde hover:bg-calma-crema',
};
export const btnClass = (v: BtnVariant = 'primario', extra?: string) =>
  cx('inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40', BTN[v], extra);

export function Boton({ variant = 'primario', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button type="button" className={btnClass(variant, className)} {...rest} />;
}

export function Barra({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2.5 w-full overflow-hidden rounded-full bg-calma-crema">
      <div className="h-full rounded-full bg-calma-salvia transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EstadoGuardado({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  const map = {
    guardando: { icon: <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />, text: 'Guardando…', cls: 'text-calma-gris' },
    guardado: { icon: <Check aria-hidden className="h-3.5 w-3.5" />, text: 'Guardado en este dispositivo', cls: 'text-calma-verde' },
    error: { icon: <CloudOff aria-hidden className="h-3.5 w-3.5" />, text: 'No se pudo guardar. Revisa el espacio del navegador.', cls: 'text-[#9a5a43]' },
  }[state];
  return (
    <span role="status" className={cx('inline-flex items-center gap-1.5 text-xs', map.cls)}>
      {map.icon}
      {map.text}
    </span>
  );
}

export function CampoTexto({ id, label, hint, value, onChange, rows = 4, placeholder }: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold leading-snug text-calma-verde">
        {label}
      </label>
      {hint && <p className="-mt-1 text-xs text-calma-gris">{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-2xl bg-calma-crema/60 px-4 py-3 text-[15px] leading-relaxed text-calma-tinta outline-none ring-1 ring-calma-linea placeholder:text-calma-gris/70 focus:bg-white focus:ring-2 focus:ring-calma-salvia"
      />
    </div>
  );
}

/** Confirmación dentro de la página (los diálogos del navegador no siempre están disponibles). */
export function Confirmar({ trigger, question, confirmLabel, onConfirm, variant = 'secundario' }: { trigger: ReactNode; question: string; confirmLabel: string; onConfirm: () => Promise<void> | void; variant?: BtnVariant }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!open) {
    return (
      <Boton variant={variant} onClick={() => setOpen(true)}>
        {trigger}
      </Boton>
    );
  }
  return (
    <div role="alertdialog" aria-label={question} className="flex flex-col gap-3 rounded-2xl bg-calma-terracota/10 p-4 ring-1 ring-calma-terracota/40">
      <p className="text-sm text-calma-tinta">{question}</p>
      <div className="flex flex-wrap gap-2">
        <Boton
          variant="sos"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
              setOpen(false);
            }
          }}
        >
          {confirmLabel}
        </Boton>
        <Boton variant="secundario" onClick={() => setOpen(false)}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}

export function Cargando({ label = 'Cargando…' }: { label?: string }) {
  return (
    <p role="status" className="flex items-center gap-2 py-8 text-sm text-calma-gris">
      <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> {label}
    </p>
  );
}

export function Aviso({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' }) {
  return (
    <p role={tone === 'error' ? 'alert' : undefined} className={cx('rounded-2xl px-4 py-3 text-sm', tone === 'error' ? 'bg-calma-terracota/10 text-[#7e4634] ring-1 ring-calma-terracota/40' : 'bg-calma-crema text-calma-verde')}>
      {children}
    </p>
  );
}

export function TituloPagina({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1.5">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="text-balance font-display text-[28px] font-semibold leading-tight text-calma-verde">{title}</h1>
      {intro && <p className="max-w-prose text-[15px] leading-relaxed text-calma-gris">{intro}</p>}
    </header>
  );
}
