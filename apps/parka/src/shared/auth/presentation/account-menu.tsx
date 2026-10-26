import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Check,
  ChevronsUpDown,
  LogOut,
  TriangleAlert,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Skeleton } from '@/shared/ui/skeleton';
import { Toast, type ToastNotice } from '@/shared/ui/toast';
import { APP_ROUTER } from '@/shared/router/routes';
import {
  ERROR_CODES,
  MAX_ACCOUNTS,
  SWITCH_TOAST_KEY,
} from '../configuration/constraints';
import type { Account, Accounts, AuthUser } from '../domain/models';
import {
  fetchAccounts,
  logoutAccount,
  switchAccount,
} from '../integration/repository';
import { useAuthContext } from './context';

type Props = {
  /** Where the nav sits; decides how the trigger looks. */
  placement: 'side' | 'bottom';
};

type Loaded =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; accounts: Accounts };

const ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-hover focus-visible:bg-hover focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 aria-disabled:opacity-50';

const AccountAvatar = ({
  email,
  avatarUrl,
}: {
  email: string;
  avatarUrl: string | null;
}) =>
  avatarUrl ? (
    <img
      src={avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      className="size-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark"
    >
      {(email[0] ?? '?').toUpperCase()}
    </span>
  );

/** Roving focus between the enabled menu items. */
const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      '[role^="menuitem"]:not([aria-disabled="true"]):not(:disabled)',
    ),
  ];
  if (items.length === 0) return;
  const at = items.indexOf(document.activeElement as HTMLElement);
  const target = {
    ArrowDown: (at + 1) % items.length,
    ArrowUp: (at - 1 + items.length) % items.length,
    Home: 0,
    End: items.length - 1,
  }[event.key];
  if (target === undefined) return;
  event.preventDefault();
  items[target].focus();
};

const SwitchingScreen = ({ email }: { email: string }) => (
  <div
    role="status"
    aria-live="polite"
    data-e2e="account-menu:switching"
    className="fixed inset-0 z-(--z-tooltip) flex flex-col gap-4 bg-surface p-4 lg:p-8"
  >
    <p className="text-sm font-medium text-ink-soft">
      Przełączanie na {email}…
    </p>
    <Skeleton className="h-10 w-2/3 max-w-md" />
    <Skeleton className="h-40 w-full max-w-3xl" />
    <Skeleton className="h-24 w-full max-w-3xl" />
    <Skeleton className="h-24 w-full max-w-3xl" />
  </div>
);

const MenuBody = ({
  state,
  user,
  busy,
  onSwitch,
  onLogout,
  onRetry,
}: {
  state: Loaded;
  user: AuthUser;
  busy: boolean;
  onSwitch: (account: Account) => void;
  onLogout: (target: 'active' | 'all') => void;
  onRetry: () => void;
}) => {
  if (state.status === 'loading')
    return (
      <div
        data-e2e="account-menu:loading"
        role="status"
        aria-label="Wczytywanie kont"
        className="flex flex-col gap-2 p-2"
      >
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );

  if (state.status === 'error')
    return (
      <div
        role="alert"
        data-e2e="account-menu:load-error"
        className="flex flex-col items-center gap-2 p-3 text-center"
      >
        <TriangleAlert className="size-6 text-danger" aria-hidden="true" />
        <p className="text-sm font-semibold text-ink">
          Nie udało się wczytać kont
        </p>
        <p className="font-mono text-xs text-danger">{ERROR_CODES.load}</p>
        <p className="text-xs text-ink-soft">
          Sprawdź połączenie i spróbuj ponownie.
        </p>
        <button
          type="button"
          role="menuitem"
          onClick={onRetry}
          className={cn(ITEM, 'justify-center font-semibold')}
        >
          Spróbuj ponownie
        </button>
      </div>
    );

  const { items } = state.accounts;
  const full = items.length >= MAX_ACCOUNTS;

  return (
    <>
      <div role="group" aria-label="Zalogowane konta">
        {items.map((account) => {
          const active = account.id === user.id;
          return (
            <button
              key={account.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              disabled={busy}
              data-e2e={`account-menu:account:${account.id}`}
              onClick={() => (active ? undefined : onSwitch(account))}
              className={cn(ITEM, active && 'bg-brand-softer')}
            >
              <AccountAvatar
                email={account.email}
                avatarUrl={account.avatarUrl}
              />
              <span className="min-w-0 flex-1 truncate">{account.email}</span>
              {active ? (
                <Check className="size-4 text-brand" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>
      <div role="separator" className="my-1 border-t border-line" />
      <a
        href={APP_ROUTER.signIn()}
        role="menuitem"
        aria-disabled={full}
        data-e2e="account-menu:add"
        onClick={(event) => full && event.preventDefault()}
        className={ITEM}
      >
        <UserPlus className="size-4" aria-hidden="true" />
        {full ? `Limit kont: ${MAX_ACCOUNTS}` : 'Dodaj konto'}
      </a>
      <button
        type="button"
        role="menuitem"
        disabled={busy}
        data-e2e="account-menu:logout"
        onClick={() => onLogout('active')}
        className={ITEM}
      >
        <LogOut className="size-4" aria-hidden="true" />
        Wyloguj to konto
      </button>
      {items.length > 1 ? (
        <button
          type="button"
          role="menuitem"
          disabled={busy}
          data-e2e="account-menu:logout-all"
          onClick={() => onLogout('all')}
          className={ITEM}
        >
          <Users className="size-4" aria-hidden="true" />
          Wyloguj ze wszystkich
        </button>
      ) : null}
    </>
  );
};

/**
 * Nav account switcher. The server owns every session; this only lists the
 * accounts, asks for a switch and then reloads so no data of the previous
 * account survives in memory.
 */
export const AccountMenu = ({ placement }: Props) => {
  const auth = useAuthContext();
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Loaded>({ status: 'loading' });
  const [switchingTo, setSwitchingTo] = useState<Account | null>(null);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetchAccounts().then(
      (accounts) => active && setState({ status: 'ready', accounts }),
      () => active && setState({ status: 'error' }),
    );
    return () => {
      active = false;
    };
  }, [open, attempt]);

  useEffect(() => {
    if (open && state.status === 'ready')
      menu.current
        ?.querySelector<HTMLElement>('[aria-checked="true"]')
        ?.focus();
  }, [open, state.status]);

  if (auth.status !== 'authenticated') return null;
  const { user } = auth;

  const fail = (title: string, code: string, retry: () => void) =>
    setNotice({
      tone: 'error',
      title,
      code,
      description: 'Spróbuj ponownie za chwilę.',
      retry,
    });

  const onSwitch = async (account: Account) => {
    setOpen(false);
    setSwitchingTo(account);
    try {
      await switchAccount(account.id);
      try {
        window.sessionStorage.setItem(SWITCH_TOAST_KEY, account.email);
      } catch {
        // Private mode: the switch worked, only the confirmation toast is lost.
      }
      window.location.assign(APP_ROUTER.dashboard());
    } catch {
      setSwitchingTo(null);
      fail(
        'Nie udało się przełączyć konta',
        ERROR_CODES.switch,
        () => void onSwitch(account),
      );
    }
  };

  const onLogout = async (target: 'active' | 'all') => {
    setOpen(false);
    try {
      window.location.assign(await logoutAccount(target));
    } catch {
      fail(
        'Nie udało się wylogować',
        ERROR_CODES.logout,
        () => void onLogout(target),
      );
    }
  };

  const onOpenChange = (next: boolean) => {
    if (next) setState({ status: 'loading' });
    setOpen(next);
  };

  const side = placement === 'side';

  return (
    <>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger
          data-e2e="account-menu:trigger"
          aria-haspopup="menu"
          aria-label={`Konto: ${user.email}`}
          className={cn(
            'flex items-center rounded-xl focus-visible:outline-2 focus-visible:outline-brand',
            side
              ? 'w-full gap-3 px-3 py-2 hover:bg-hover'
              : 'flex-1 flex-col gap-1 py-1 text-xs font-medium text-ink-soft',
          )}
        >
          {side ? (
            <>
              <AccountAvatar email={user.email} avatarUrl={user.avatarUrl} />
              <span className="min-w-0 flex-1 truncate text-left text-sm text-ink">
                {user.email}
              </span>
              <ChevronsUpDown
                className="size-4 shrink-0 text-ink-soft"
                aria-hidden="true"
              />
            </>
          ) : (
            <>
              <UserRound className="size-5" aria-hidden="true" />
              Konto
            </>
          )}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            ref={menu}
            role="menu"
            aria-label="Konta"
            data-keeps-nav
            data-e2e="account-menu:menu"
            side="top"
            align={side ? 'start' : 'end'}
            sideOffset={8}
            collisionPadding={16}
            onKeyDown={onMenuKeyDown}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              (
                menu.current?.querySelector<HTMLElement>(
                  '[aria-checked="true"]',
                ) ?? menu.current
              )?.focus();
            }}
            className="z-(--z-modal) w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line-strong bg-card p-1 shadow-card focus:outline-none"
          >
            <MenuBody
              state={state}
              user={user}
              busy={switchingTo !== null}
              onSwitch={(account) => void onSwitch(account)}
              onLogout={(target) => void onLogout(target)}
              onRetry={() => {
                setState({ status: 'loading' });
                setAttempt((n) => n + 1);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {switchingTo ? <SwitchingScreen email={switchingTo.email} /> : null}
      {notice ? (
        <Toast
          key={notice.tone === 'error' ? notice.code : notice.message}
          notice={notice}
          data-e2e="account-menu:toast"
          onClose={() => setNotice(null)}
        />
      ) : null}
    </>
  );
};
