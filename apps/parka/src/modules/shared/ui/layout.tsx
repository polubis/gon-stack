import type { ReactNode } from 'react';
import { ArrowLeft, Home, Wallet, ChartColumn, LayoutGrid } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';

type NavKey = 'start' | 'expenses' | 'stats' | 'more';

const NAV: { key: NavKey; label: string; href: string; icon: typeof Home }[] = [
  { key: 'start', label: 'Start', href: '/dashboard/', icon: Home },
  { key: 'expenses', label: 'Wydatki', href: '/expenses/', icon: Wallet },
  {
    key: 'stats',
    label: 'Statystyki',
    href: '/statistics/',
    icon: ChartColumn,
  },
  { key: 'more', label: 'Więcej', href: '/settings/', icon: LayoutGrid },
];

export const BottomNav = ({ active }: { active: NavKey }) => (
  <nav
    aria-label="Nawigacja główna"
    className="sticky bottom-0 z-10 mt-auto flex items-stretch justify-around border-t border-black/5 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
  >
    {NAV.map(({ key, label, href, icon: Icon }) => {
      const isActive = key === active;
      return (
        <a
          key={key}
          href={href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-xs font-medium',
            isActive ? 'text-brand' : 'text-ink-soft',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </a>
      );
    })}
  </nav>
);

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
      {nav ? <BottomNav active={nav} /> : null}
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
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-black/5"
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
      'rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(16,36,27,0.04)]',
      className,
    )}
    {...rest}
  >
    {children}
  </As>
);
