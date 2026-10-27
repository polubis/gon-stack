import { type ComponentProps, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Flag,
  Inbox,
  ListChecks,
  Repeat,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import {
  NEW_BACKLOG_MODAL,
  NEW_CATEGORY_MODAL,
  NEW_PRIORITY_MODAL,
  NEW_RECURRING_TASK_MODAL,
  NEW_TASK_MODAL,
} from './modal-ids';

const OPTIONS: readonly { label: string; modal: string; icon: LucideIcon }[] = [
  { label: 'Zadanie', modal: NEW_TASK_MODAL, icon: ListChecks },
  { label: 'Zadanie cykliczne', modal: NEW_RECURRING_TASK_MODAL, icon: Repeat },
  { label: 'Do backlogu', modal: NEW_BACKLOG_MODAL, icon: Inbox },
  { label: 'Kategoria', modal: NEW_CATEGORY_MODAL, icon: Tag },
  { label: 'Priorytet', modal: NEW_PRIORITY_MODAL, icon: Flag },
];

const KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

/** Arrow, Home and End keys move focus between the menu items. */
export const moveFocus = (e: KeyboardEvent<HTMLElement>) => {
  if (!KEYS.includes(e.key)) return;
  const items = [
    ...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ];
  const at = items.indexOf(document.activeElement as HTMLElement);
  const last = items.length - 1;
  const target =
    e.key === 'Home'
      ? 0
      : e.key === 'End'
        ? last
        : e.key === 'ArrowDown'
          ? (at + 1) % items.length
          : (at - 1 + items.length) % items.length;
  e.preventDefault();
  items[target]?.focus();
};

/** "Dodaj" trigger + chooser of what to create; every option opens its form modal. */
export const AddMenu = ({
  children,
  side,
  ...trigger
}: Omit<ComponentProps<typeof Popover.Trigger>, 'type'> & {
  side: 'top' | 'bottom';
}) => {
  const { open, setOpen } = usePopoverOpen(`add-menu:${side}`);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger {...trigger} aria-haspopup="menu">
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-e2e="time:add-menu"
          side={side}
          align="end"
          sideOffset={8}
          collisionPadding={16}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement)
              .querySelector<HTMLElement>('[role="menuitem"]')
              ?.focus();
          }}
          className="z-(--z-modal) w-52 animate-pop-in rounded-xl border border-line-strong bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div
            role="menu"
            aria-label="Dodaj"
            onKeyDown={moveFocus}
            className="flex flex-col gap-1"
          >
            {OPTIONS.map(({ label, modal, icon: Icon }) => (
              <button
                key={modal}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  openModal(modal);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                )}
              >
                <Icon className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
