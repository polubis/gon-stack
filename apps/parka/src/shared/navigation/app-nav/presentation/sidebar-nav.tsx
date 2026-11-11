import { cn } from '@repo/react-kit/cn';
import { AccountMenu } from '@/shared/auth/presentation/account-menu';
import { BrandMark } from '@/shared/ui/brand-mark';
import { NAV_ITEMS } from '../configuration/constraints';
import type { NavKey } from '../domain/models';

type Props = {
  active: NavKey;
};

/** Desktop left sidebar (`lg` and up) for signed-in app routes. */
export const SidebarNav = ({ active }: Props) => (
  <aside className="glass m-4 mr-0 flex h-[calc(100%-2rem)] flex-col gap-8 rounded-4xl px-4 py-6">
    <a
      href={NAV_ITEMS[0].href}
      className="flex items-center gap-3 px-2 text-2xl font-bold tracking-tight text-ink"
    >
      <BrandMark />
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
              'pressable flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold',
              isActive
                ? 'cta shadow-cta'
                : 'text-ink-soft hover:bg-hover hover:text-ink',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
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
