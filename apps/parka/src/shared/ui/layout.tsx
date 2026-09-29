import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

type ScreenHeaderProps = {
  title: string;
  backHref?: string;
  action?: ReactNode;
};

export const ScreenHeader = ({
  title,
  backHref,
  action,
}: ScreenHeaderProps) => (
  <header className="flex items-center gap-2 px-4 py-4">
    {backHref ? (
      <a
        href={backHref}
        aria-label="Wróć"
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-hover"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </a>
    ) : null}
    <h1 className="flex-1 text-lg font-semibold">{title}</h1>
    {action}
  </header>
);

export const Card = ({
  children,
  className,
  as: As = 'div',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'label';
} & Record<string, unknown>) => (
  <As
    className={cn(
      'rounded-2xl border border-line bg-card p-4 shadow-card',
      className,
    )}
    {...rest}
  >
    {children}
  </As>
);
