import * as Popover from '@radix-ui/react-popover';
import { CheckCheck, EllipsisVertical, ListChecks, Trash2 } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import { ACTIONS_MENU_KEY, DELETE_MODAL } from '../configuration/constraints';
import { useContext } from './context';

const ROUND_BUTTON =
  'pressable inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-3.5 text-xs font-semibold text-ink shadow-card hover:bg-brand-softer disabled:text-ink-soft disabled:opacity-60 disabled:hover:bg-card';

/** Menu of bulk operations on the selection; today only delete. Open state lives in the URL. */
const ActionsMenu = () => {
  const ctx = useContext();
  const count = ctx.useSelected().length;
  const { open, setOpen, openModal } = usePopoverOpen(ACTIONS_MENU_KEY);

  return (
    <Popover.Root modal open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        data-e2e="notifications:actions-trigger"
        aria-haspopup="menu"
        className={ROUND_BUTTON}
      >
        <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
        <span className="max-sm:sr-only">Akcje</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-e2e="notifications:actions-menu"
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-(--z-popover) w-56 animate-pop-in rounded-2xl border border-line bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div
            role="menu"
            aria-label="Akcje na zaznaczonych"
            className="flex flex-col gap-1"
          >
            <button
              type="button"
              role="menuitem"
              data-e2e="notifications:delete-selected"
              disabled={count === 0}
              onClick={() => openModal(DELETE_MODAL)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-faint focus-visible:bg-danger-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:text-ink-soft disabled:opacity-60 disabled:hover:bg-transparent',
              )}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Usuń zaznaczone ({count})
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

/** Mark-all-read plus the select button, which turns into the actions menu in select mode. */
export const HeaderActions = () => {
  const ctx = useContext();
  const unread = ctx.useUnreadCount();
  const selecting = ctx.useSelecting();
  const total = ctx.useNotifications().length;

  return (
    <>
      <button
        type="button"
        data-e2e="notifications:mark-all-read"
        disabled={unread === 0}
        onClick={ctx.markAllRead}
        className={ROUND_BUTTON}
      >
        <CheckCheck className="h-4 w-4" aria-hidden="true" />
        <span className="max-sm:sr-only">
          Oznacz wszystkie jako przeczytane
        </span>
      </button>
      {selecting ? (
        <ActionsMenu />
      ) : (
        <button
          type="button"
          data-e2e="notifications:select-toggle"
          disabled={total === 0}
          onClick={ctx.toggleSelecting}
          className={ROUND_BUTTON}
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          <span className="max-sm:sr-only">Zaznacz</span>
        </button>
      )}
    </>
  );
};
