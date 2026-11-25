import { ChevronRight, UserRound } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { ACCOUNT_MODAL } from '../configuration/constraints';
import { AccountAvatar } from './account-avatar';
import { useAuthContext } from './context';
import { useProfileSummary } from './profile-summary';
import { UnreadBadge } from './unread-badge';
import { useUnreadSummary } from './unread-summary';

type Props = {
  /** Where the nav sits; decides how the trigger looks. */
  placement: 'side' | 'bottom';
};

/**
 * Nav account button. Opens the account drawer (see `AccountDrawer`), which
 * lives in the URL modal stack. Shows the user's picture once one is set.
 */
export const AccountMenu = ({ placement }: Props) => {
  const auth = useAuthContext();
  const profile = useProfileSummary();
  const unread = useUnreadSummary();
  if (auth.status !== 'authenticated') return null;
  const { user } = auth;
  const avatarUrl = profile.avatarUrl ?? user.avatarUrl;
  const side = placement === 'side';

  return (
    <button
      type="button"
      data-e2e="account-menu:trigger"
      aria-haspopup="dialog"
      aria-label={
        unread > 0
          ? `Konto: ${user.email}, nieprzeczytane powiadomienia: ${unread}`
          : `Konto: ${user.email}`
      }
      onClick={() => openModal(ACCOUNT_MODAL)}
      className={cn(
        'relative flex items-center rounded-full focus-visible:outline-2 focus-visible:outline-brand',
        side
          ? 'w-full gap-3 bg-hover-soft p-2 pr-3 hover:bg-hover'
          : 'h-12 w-full justify-center text-ink-soft hover:bg-hover hover:text-ink',
      )}
    >
      {side ? (
        <>
          <AccountAvatar
            label={profile.name || user.displayName || user.email}
            avatarUrl={avatarUrl}
          />
          <span className="min-w-0 flex-1 truncate text-left text-sm text-ink">
            {profile.name || user.displayName || user.email}
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-ink-soft"
            aria-hidden="true"
          />
          <UnreadBadge className="left-9 right-auto top-0" />
        </>
      ) : (
        <>
          {avatarUrl ? (
            <AccountAvatar
              label={user.email}
              avatarUrl={avatarUrl}
              className="size-7"
            />
          ) : (
            <UserRound className="size-5" aria-hidden="true" />
          )}
          <span className="sr-only">Konto</span>
          <UnreadBadge className="left-1/2 right-auto top-1 ml-1" />
        </>
      )}
    </button>
  );
};
