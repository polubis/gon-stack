import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Check,
  LogOut,
  Pencil,
  TriangleAlert,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  closeModal,
  openModal,
  useModal,
  useModalMounted,
} from '@/shared/router/modal-stack';
import { Skeleton } from '@/shared/ui/skeleton';
import { Toast, type ToastNotice } from '@/shared/ui/toast';
import { APP_ROUTER } from '@/shared/router/routes';
import {
  ACCOUNT_MODAL,
  ERROR_CODES,
  MAX_ACCOUNTS,
  PROFILE_MODAL,
  SWITCH_TOAST_KEY,
} from '../configuration/constraints';
import type { Account, Accounts, AuthUser } from '../domain/models';
import {
  fetchAccounts,
  logoutAccount,
  switchAccount,
} from '../integration/repository';
import { AccountAvatar } from './account-avatar';
import { useAuthContext } from './context';
import { useProfileSummary } from './profile-summary';

type Loaded =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; accounts: Accounts };

const ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-ink hover:bg-hover focus-visible:bg-hover focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 aria-disabled:opacity-50';

const SwitchingScreen = ({ email }: { email: string }) => (
  <div
    role="status"
    aria-live="polite"
    data-e2e="account-menu:switching"
    className="fixed inset-0 z-(--z-modal) flex flex-col gap-4 bg-surface p-4 lg:p-8"
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

const Options = ({
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
        className="flex flex-col gap-2"
      >
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
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
      <div role="radiogroup" aria-label="Zalogowane konta">
        {items.map((account) => {
          const active = account.id === user.id;
          return (
            <button
              key={account.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={busy}
              data-e2e={`account-menu:account:${account.id}`}
              onClick={() => (active ? undefined : onSwitch(account))}
              className={cn(ITEM, active && 'bg-brand-softer')}
            >
              <AccountAvatar
                label={account.email}
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

const Drawer = ({
  user,
  busy,
  onSwitch,
  onLogout,
}: {
  user: AuthUser;
  busy: boolean;
  onSwitch: (account: Account) => void;
  onLogout: (target: 'active' | 'all') => void;
}) => {
  const profile = useProfileSummary();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Loaded>({ status: 'loading' });
  useModalMounted(ACCOUNT_MODAL);

  useEffect(() => {
    let active = true;
    fetchAccounts().then(
      (accounts) => active && setState({ status: 'ready', accounts }),
      () => active && setState({ status: 'error' }),
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const name = profile.name || user.displayName;

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) closeModal(ACCOUNT_MODAL);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="account-menu:menu"
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-(--z-modal) flex w-full max-w-sm animate-drawer-in flex-col overflow-y-auto overscroll-contain bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div className="flex items-start gap-3">
            <AccountAvatar
              label={name ?? user.email}
              avatarUrl={profile.avatarUrl ?? user.avatarUrl}
              className="size-14 text-xl"
            />
            <div className="min-w-0 flex-1">
              <Dialog.Title
                data-e2e="account-menu:name"
                className="truncate text-base font-semibold"
              >
                {name ?? user.email}
              </Dialog.Title>
              {name ? (
                <p className="truncate text-sm text-ink-soft">{user.email}</p>
              ) : null}
              <button
                type="button"
                data-e2e="account-menu:edit"
                onClick={() => openModal(PROFILE_MODAL)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium hover:bg-hover focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edytuj profil
              </button>
            </div>
            <Dialog.Close
              aria-label="Zamknij"
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="mt-auto flex flex-col pt-6">
            <Options
              state={state}
              user={user}
              busy={busy}
              onSwitch={onSwitch}
              onLogout={onLogout}
              onRetry={() => {
                setState({ status: 'loading' });
                setAttempt((n) => n + 1);
              }}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/**
 * Account drawer, one per app shell. The server owns every session; this only
 * lists the accounts, asks for a switch and then reloads so no data of the
 * previous account survives in memory. Open state lives in the URL modal
 * stack, so Back closes it and a reload restores it.
 */
export const AccountDrawer = () => {
  const auth = useAuthContext();
  const { isOpen } = useModal(ACCOUNT_MODAL);
  const [switchingTo, setSwitchingTo] = useState<Account | null>(null);
  const [notice, setNotice] = useState<ToastNotice | null>(null);

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
    closeModal(ACCOUNT_MODAL);
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
    closeModal(ACCOUNT_MODAL);
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

  return (
    <>
      {isOpen ? (
        <Drawer
          user={user}
          busy={switchingTo !== null}
          onSwitch={(account) => void onSwitch(account)}
          onLogout={(target) => void onLogout(target)}
        />
      ) : null}
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
