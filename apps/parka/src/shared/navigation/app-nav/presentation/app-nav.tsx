import { cn } from '@repo/react-kit/cn';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';

type Props = {
  active: NavKey;
};

/** Bottom nav for signed-in app routes. Stickiness comes from its wrapper. */
export const AppNav = ({ active }: Props) => {
  const current = active;
  return (
    <nav
      aria-label="Nawigacja główna"
      className="flex items-stretch justify-around border-t border-line bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
    >
      {NAV_ITEMS.filter((item) => item.mobile).map(
        ({ key, label, href, icon: Icon }) => {
          const isActive = key === current;
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
        },
      )}
    </nav>
  );
};
