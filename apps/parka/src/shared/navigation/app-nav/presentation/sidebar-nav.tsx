import { cn } from '@repo/react-kit/cn';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';

type Props = {
  active: NavKey;
};

/** Desktop left sidebar (`lg` and up) for signed-in app routes. */
export const SidebarNav = ({ active }: Props) => (
  <aside className="flex h-full flex-col gap-8 border-r border-line bg-card px-4 py-6">
    <a
      href={NAV_ITEMS[0].href}
      className="px-3 text-2xl font-bold tracking-tight text-brand"
    >
      Parka
    </a>
    <nav aria-label="Nawigacja główna" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
        const isActive = key === active;
        return (
          <a
            key={key}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-hover',
              isActive ? 'bg-brand-softer text-brand' : 'text-ink-soft',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </a>
        );
      })}
    </nav>
  </aside>
);
