import { Inbox } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { useContext } from './context';
import { BACKLOG_MODAL } from './modal-ids';

/** Header button that opens the backlog list; shows how many tasks wait in it. */
export const BacklogButton = () => {
  const { backlog } = useContext();
  const count = backlog.length;
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={count === 0 ? 'Backlog' : `Backlog, zadań: ${count}`}
      data-e2e="time:backlog-open"
      onClick={() => openModal(BACKLOG_MODAL)}
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:inline-flex md:w-auto md:gap-1.5 md:px-3 md:text-sm md:font-semibold"
    >
      <Inbox className="h-5 w-5" aria-hidden="true" />
      <span className="hidden md:inline" aria-hidden="true">
        Backlog
      </span>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-danger-strong px-1 text-micro font-bold text-on-brand md:static md:min-w-5 md:bg-brand md:px-1.5"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </button>
  );
};
