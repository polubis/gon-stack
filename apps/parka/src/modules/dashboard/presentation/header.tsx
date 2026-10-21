import { Plus, User } from 'lucide-react';
import type { Avatar } from '@/shared/avatar/domain/models';
import type { Period } from '@/shared/period/period';
import { APP_ROUTER } from '@/shared/router/routes';
import { cn } from '@repo/react-kit/cn';
import { UnreadLink } from '@/modules/notifications/presentation/unread-link';
import { PeriodControl } from '@/shared/period-control/presentation/period-control';
import { AddMenu, ADD_BUTTON } from './add-menu';
import { PeriodRangeDialog } from './period-range-dialog';

export const Header = ({
  period,
  today,
  avatar,
  onPeriodChange,
}: {
  period: Period;
  today: string;
  avatar: Avatar | null;
  onPeriodChange: (period: Period) => void;
}) => {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 md:flex-nowrap">
        <div className="min-w-0 flex-1 basis-0">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Finanse
          </h1>
        </div>

        <UnreadLink />

        <a
          href={APP_ROUTER.settings()}
          aria-label="Profil i ustawienia"
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand max-md:hidden"
        >
          {avatar ? (
            <img
              data-e2e="dashboard:avatar-image"
              alt="Twoje zdjęcie profilowe"
              width={40}
              height={40}
              src={avatar.variants.at(-1)?.url}
              srcSet={avatar.variants
                .map((v) => `${v.url} ${v.size}w`)
                .join(', ')}
              sizes="2.5rem"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" aria-hidden="true" />
          )}
        </a>

        <AddMenu
          side="bottom"
          data-e2e="dashboard:expense-new"
          className={cn(ADD_BUTTON, 'h-11 shrink-0 px-4 max-md:hidden')}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Dodaj
        </AddMenu>
      </header>
      <PeriodControl
        period={period}
        today={today}
        onChange={onPeriodChange}
        renderRange={(range) => <PeriodRangeDialog {...range} />}
      />
    </div>
  );
};
