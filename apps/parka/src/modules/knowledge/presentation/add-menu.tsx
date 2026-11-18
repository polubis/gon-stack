import { type ComponentProps, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  FolderTree,
  Inbox,
  Layers,
  ListChecks,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { useSequencedOpen } from '@/shared/navigation/overlay-nav/presentation/use-sequenced-open';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import { NEW_BACKLOG_TOPIC_MODAL, newModal } from './modal-ids';

const OPTIONS: readonly { label: string; modal: string; icon: LucideIcon }[] = [
  { label: 'Temat', modal: newModal('topic'), icon: ListChecks },
  { label: 'Temat do backlogu', modal: NEW_BACKLOG_TOPIC_MODAL, icon: Inbox },
  { label: 'Katalog', modal: newModal('catalog'), icon: FolderTree },
  { label: 'Kategoria', modal: newModal('category'), icon: Layers },
  { label: 'Tag', modal: newModal('tag'), icon: Tag },
];

const KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

/** Arrow, Home and End keys move focus between the menu items. */
const moveFocus = (e: KeyboardEvent<HTMLElement>) => {
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
  const { open, setOpen, openModal } = usePopoverOpen(
    `knowledge-add-menu:${side}`,
  );
  const sequenced = useSequencedOpen(
    `knowledge-add-menu:${side}`,
    open,
    setOpen,
  );
  return (
    <Popover.Root modal {...sequenced}>
      <Popover.Trigger {...trigger} aria-haspopup="menu">
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-e2e="knowledge:add-menu"
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
          className="z-(--z-popover) w-56 animate-pop-in rounded-2xl border border-line bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
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
                data-e2e={`knowledge:add-option:${modal}`}
                onClick={() => openModal(modal)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
