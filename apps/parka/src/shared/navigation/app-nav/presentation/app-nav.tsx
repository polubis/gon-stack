import { cn } from '@repo/react-kit/cn';
import { AccountMenu } from '@/shared/auth/presentation/account-menu';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';
import { NavIndicator } from './nav-indicator';

type Props = {
  active: NavKey | null;
};

const MOBILE_ITEMS = NAV_ITEMS.filter((item) => item.mobile);

/** Bottom nav for signed-in app routes. Stickiness comes from its wrapper. */
export const AppNav = ({ active }: Props) => {
  const activeIndex = MOBILE_ITEMS.findIndex(({ key }) => key === active);
  return (
    <nav
      aria-label="Nawigacja główna"
      className="glass mx-auto mb-[max(0.75rem,env(safe-area-inset-bottom))] mt-1 w-[calc(100%-2rem)] max-w-md rounded-full p-1.5"
    >
      <div className="relative grid grid-cols-4 gap-1">
        <NavIndicator
          axis="x"
          index={activeIndex < 0 ? null : activeIndex}
          className="h-12 w-[calc((100%-3*var(--spacing))/4)]"
        />
        {MOBILE_ITEMS.map(({ key, label, href, icon: Icon }) => {
          const isActive = key === active;
          return (
            <a
              key={key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex h-12 items-center justify-center rounded-full transition-colors duration-300 ease-enter motion-reduce:transition-none',
                isActive
                  ? 'text-on-brand'
                  : 'text-ink-soft hover:bg-hover hover:text-ink',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </a>
          );
        })}
        <AccountMenu placement="bottom" />
      </div>
    </nav>
  );
};
