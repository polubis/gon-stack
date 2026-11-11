import { ListChecks } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { STATUSES_MODAL } from './modal-ids';

/** Header button that opens the status workflow editor. */
export const StatusesButton = () => (
  <button
    type="button"
    aria-haspopup="dialog"
    aria-label="Statusy zadań"
    data-e2e="time:statuses-open"
    onClick={() => openModal(STATUSES_MODAL)}
    className="pressable grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-card text-ink shadow-card hover:bg-brand-softer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:inline-flex md:w-auto md:gap-1.5 md:px-4 md:text-sm md:font-semibold"
  >
    <ListChecks className="h-5 w-5" aria-hidden="true" />
    <span className="hidden md:inline" aria-hidden="true">
      Statusy
    </span>
  </button>
);
