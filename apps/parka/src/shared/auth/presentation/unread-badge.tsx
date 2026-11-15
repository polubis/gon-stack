import { cn } from '@repo/react-kit/cn';
import { useUnreadSummary } from './unread-summary';

/** Count pill pinned to the corner of its (relative) parent; nothing at zero. Parent labels the count. */
export const UnreadBadge = ({ className }: { className?: string }) => {
  const unread = useUnreadSummary();
  if (unread === 0) return null;
  return (
    <span
      aria-hidden="true"
      data-e2e="account-menu:unread-badge"
      className={cn(
        'absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger-strong px-1 text-micro font-bold text-on-brand ring-2 ring-surface',
        className,
      )}
    >
      {unread > 9 ? '9+' : unread}
    </span>
  );
};
