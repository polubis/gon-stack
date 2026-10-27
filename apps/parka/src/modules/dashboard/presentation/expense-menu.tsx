import * as Popover from '@radix-ui/react-popover';
import { Copy, Ellipsis } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { localMonth } from '@/shared/date/date';
import { APP_ROUTER } from '@/shared/router/routes';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import type { Expense } from '../domain/models';
import { ITEM, moveFocus } from './add-menu';

/** "More" popover of an expense row: quick actions that do not open the popup. */
export const ExpenseMenu = ({ expense }: { expense: Expense }) => {
  const { open, setOpen } = usePopoverOpen(`expense-menu:${expense.id}`);
  const label = `Więcej: ${expense.merchant}`;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-haspopup="menu"
        aria-label={label}
        data-e2e={`dashboard:expense-more:${expense.id}`}
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          open && 'bg-hover',
        )}
      >
        <Ellipsis className="h-5 w-5" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          collisionPadding={16}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement)
              .querySelector<HTMLElement>('[role="menuitem"]')
              ?.focus();
          }}
          className="z-(--z-popover) w-56 animate-pop-in rounded-xl border border-line-strong bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div
            role="menu"
            aria-label={label}
            onKeyDown={moveFocus}
            className="flex flex-col gap-1"
          >
            <a
              role="menuitem"
              aria-label={`Duplikuj: ${expense.merchant}`}
              data-e2e={`dashboard:expense-duplicate:${expense.id}`}
              href={APP_ROUTER.newExpense({
                duplicate: expense.id,
                month: localMonth(expense.date),
              })}
              className={ITEM}
            >
              <Copy className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              Duplikuj
            </a>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
