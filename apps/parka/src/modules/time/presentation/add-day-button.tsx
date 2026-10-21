import { Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { fullDate } from '../domain/period-title';
import { newTaskOnModal } from './modal-ids';

/** Plus on a list item: opens the add-task form with that day filled in. */
export const AddDayButton = ({ day }: { day: string }) => (
  <button
    type="button"
    aria-haspopup="dialog"
    aria-label={`Dodaj zadanie na ${fullDate(day)}`}
    data-e2e={`time:add-day:${day}`}
    onClick={() => openModal(newTaskOnModal(day))}
    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
  >
    <Plus className="h-4 w-4" aria-hidden="true" />
  </button>
);
