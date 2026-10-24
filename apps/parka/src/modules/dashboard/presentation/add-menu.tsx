import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Camera,
  Repeat,
  Receipt,
  Tag,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import { NEW_CATEGORY_MODAL } from '@/modules/categories/presentation/modal-ids';
import { openModal } from '@/shared/router/modal-stack';
import { navigateTo } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { stashReceipt } from '@/shared/receipt-handoff/receipt-handoff';

type Option = { label: string; icon: LucideIcon } & (
  { href: string } | { modal: string } | { pick: 'photo' | 'file' }
);

const OPTIONS: readonly Option[] = [
  { label: 'Wydatek', icon: Receipt, href: APP_ROUTER.newExpense() },
  {
    label: 'Wydatek cykliczny',
    icon: Repeat,
    href: APP_ROUTER.newExpense({ type: 'recurring' }),
  },
  { label: 'Ze zdjęcia', icon: Camera, pick: 'photo' },
  { label: 'Z pliku', icon: Upload, pick: 'file' },
  { label: 'Kategoria', icon: Tag, modal: NEW_CATEGORY_MODAL },
];

const KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

export const ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

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

/** "Dodaj" trigger + chooser: expense and recurring expense pages, category popup. */
export const AddMenu = ({
  children,
  side,
  ...trigger
}: Omit<ComponentProps<typeof Popover.Trigger>, 'type'> & {
  side: 'top' | 'bottom';
}) => {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const onPicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await stashReceipt(file);
    navigateTo(APP_ROUTER.newExpense());
  };

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger {...trigger} aria-haspopup="menu">
          {children}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            data-e2e="dashboard:add-menu"
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
            className="z-(--z-modal) w-56 animate-pop-in rounded-xl border border-line-strong bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
          >
            <div
              role="menu"
              aria-label="Dodaj"
              onKeyDown={moveFocus}
              className="flex flex-col gap-1"
            >
              {OPTIONS.map((option) => {
                const content = (
                  <>
                    <option.icon
                      className="h-4 w-4 text-ink-soft"
                      aria-hidden="true"
                    />
                    {option.label}
                  </>
                );
                return 'href' in option ? (
                  <a
                    key={option.label}
                    role="menuitem"
                    href={option.href}
                    className={ITEM}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    key={option.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      if ('modal' in option) openModal(option.modal);
                      else
                        (option.pick === 'photo'
                          ? cameraRef
                          : fileRef
                        ).current?.click();
                    }}
                    className={ITEM}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        aria-label="Plik ze zdjęciem paragonu"
        onChange={onPicked}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label="Zdjęcie paragonu z aparatu"
        onChange={onPicked}
      />
    </>
  );
};

/** Look of the "Dodaj" trigger, same as the time module. */
export const ADD_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-on-brand transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';
