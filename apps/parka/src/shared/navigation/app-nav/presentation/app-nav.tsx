import { cn } from '@repo/react-kit/cn';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';

type Props = {
  active: NavKey;
};

/** Sticky bottom nav for signed-in app routes. */
export const AppNav = ({ active }: Props) => (
  <nav
    aria-label="Nawigacja główna"
    className="sticky bottom-0 z-10 mt-auto flex items-stretch justify-around border-t border-black/5 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
  >
    {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
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
