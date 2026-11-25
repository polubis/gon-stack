import { cn } from '@repo/react-kit/cn';
import { AccountMenu } from '@/shared/auth/presentation/account-menu';
import { BrandMark } from '@/shared/ui/brand-mark';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';
import { NavIndicator } from './nav-indicator';

type Props = {
  active: NavKey | null;
};

/** Desktop left sidebar (`lg` and up) for signed-in app routes. */
export const SidebarNav = ({ active }: Props) => {
  const activeIndex = NAV_ITEMS.findIndex(({ key }) => key === active);
  return (
    <aside className="glass m-4 mr-0 flex h-[calc(100%-2rem)] flex-col gap-8 rounded-4xl px-4 py-6">
      <a
        href={NAV_ITEMS[0].href}
        className="flex items-center gap-3 px-2 text-2xl font-bold tracking-tight text-ink"
      >
        <BrandMark />
        Parka
      </a>
      <nav
        aria-label="Nawigacja główna"
        className="relative flex flex-col gap-1"
      >
        <NavIndicator
          axis="y"
          index={activeIndex < 0 ? null : activeIndex}
          className="h-12 w-full"
        />
        {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
          const isActive = key === active;
          return (
            <a
              key={key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex h-12 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors duration-300 ease-enter motion-reduce:transition-none',
                isActive
                  ? 'text-on-brand'
                  : 'text-ink-soft hover:bg-hover hover:text-ink',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </nav>
      <div className="mt-auto">
        <AccountMenu placement="side" />
      </div>
    </aside>
  );
};
