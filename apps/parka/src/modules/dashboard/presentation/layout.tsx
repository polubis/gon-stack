import type { ReactNode } from 'react';
import { Home, Wallet, ChartColumn, LayoutGrid } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { DashboardE2eId } from '../configuration/e2e-ids';

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

const BottomNav = ({ active }: { active: NavKey }) => (
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
  e2e: DashboardE2eId;
  nav?: NavKey;
};

/** Mobile-first centered app frame. */
export const AppShell = ({ children, e2e, nav }: ShellProps) => (
  <div className="min-h-screen w-full bg-surface">
    <div
      data-e2e={e2e}
      className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface shadow-sm"
    >
      {children}
      {nav ? <BottomNav active={nav} /> : null}
    </div>
  </div>
);

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(16,36,27,0.04)]',
      className,
    )}
  >
    {children}
  </div>
);
