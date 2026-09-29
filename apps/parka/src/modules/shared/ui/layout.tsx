import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';
import { AppNav, type NavKey } from '@/shared/navigation/app-nav';

type ShellProps = {
  children: ReactNode;
  e2e: E2eId;
  nav?: NavKey;
  title?: string;
};

/** Mobile-first centered app frame used by every signed-in screen. */
export const AppShell = ({ children, e2e, nav, title }: ShellProps) => (
  <div className="min-h-screen w-full bg-surface">
    <div
      data-e2e={e2e}
      className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface shadow-sm"
    >
      {title ? (
        <header className="flex items-center gap-3 px-5 pb-2 pt-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </header>
      ) : null}
      {children}
      {nav ? <AppNav active={nav} /> : null}
    </div>
  </div>
);

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
