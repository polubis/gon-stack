import { type ReactNode } from 'react';
import { cn } from '@/libs/ui/cn';

// ── Utilities ──────────────────────────────────────────────────────────────────

export const inputCls = (hasError?: boolean) =>
  cn(
    'w-full rounded-xs border bg-canvas px-4 py-3 text-sm text-ink placeholder:text-muted',
    'outline-none transition-colors',
    hasError
      ? 'border-coral/60 focus:border-coral'
      : 'border-hairline focus:border-primary',
  );

// ── Component ──────────────────────────────────────────────────────────────────

export type FieldProps = {
  label: string;
  error?: string;
  htmlFor?: string;
  optional?: boolean;
  children: ReactNode;
};

export const Field = ({
  label,
  error,
  htmlFor,
  optional,
  children,
}: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {label}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-muted">
          (opcjonalne)
        </span>
      )}
    </label>
    {children}
    {error && <p className="text-xs text-coral">{error}</p>}
  </div>
);
