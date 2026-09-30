import { cn } from '@repo/react-kit/cn';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';

type Props = {
  active: NavKey;
};

/** Desktop header nav (`lg` and up) for signed-in app routes. */
export const TopNav = ({ active }: Props) => (
  <header className="border-b border-line bg-card">
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-10 py-3 xl:px-16">
      <span className="text-lg font-bold tracking-tight text-brand">Parka</span>
      <nav aria-label="Nawigacja główna" className="flex items-center gap-1">
        {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
          const isActive = key === active;
          return (
            <a
              key={key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-hover',
                isActive ? 'bg-brand-softer text-brand' : 'text-ink-soft',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </nav>
    </div>
  </header>
);
