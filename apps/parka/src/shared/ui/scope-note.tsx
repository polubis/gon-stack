import type { ComponentProps } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

/** Says what a change or a delete reaches before the user commits to it. */
export const ScopeNote = ({
  children,
  className,
  ...props
}: ComponentProps<'p'>) => (
  <p
    role="note"
    {...props}
    className={cn(
      'flex items-start gap-2 rounded-xl bg-brand-softer p-3 text-sm text-ink',
      className,
    )}
  >
    <Info
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark"
      aria-hidden="true"
    />
    <span>{children}</span>
  </p>
);
