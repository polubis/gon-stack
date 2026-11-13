import { cn } from '@repo/react-kit/cn';
import { AccountMenu } from '@/shared/auth/presentation/account-menu';
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
      className="glass mx-auto mb-[max(0.75rem,env(safe-area-inset-bottom))] mt-1 flex w-[calc(100%-2rem)] max-w-md items-center gap-1 rounded-full p-1.5"
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
                'flex h-12 items-center justify-center rounded-full px-4 text-sm font-semibold transition-[background-color,color] duration-300 ease-enter motion-reduce:transition-none',
                isActive
                  ? 'cta shadow-cta grow-2'
                  : 'grow text-ink-soft hover:bg-hover hover:text-ink',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-opacity duration-300 ease-enter motion-reduce:transition-none',
                  isActive ? 'ml-2 max-w-24 opacity-100' : 'max-w-0 opacity-0',
                )}
              >
                {label}
              </span>
            </a>
          );
        },
      )}
      <AccountMenu placement="bottom" />
    </nav>
  );
};
