import { SlidersHorizontal } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { activeFilterCount } from '../domain/filters';
import { useContext } from './context';
import { FILTERS_MODAL } from './modal-ids';

/** Header button that opens the filters panel; shows how many filters narrow the lists. */
export const FiltersButton = () => {
  const { filters } = useContext();
  const count = activeFilterCount(filters);
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={count === 0 ? 'Filtry' : `Filtry, aktywne: ${count}`}
      data-e2e="time:filters-open"
      onClick={() => openModal(FILTERS_MODAL)}
      className="pressable relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-card text-ink shadow-card hover:bg-brand-softer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:inline-flex md:w-auto md:gap-1.5 md:px-4 md:text-sm md:font-semibold"
    >
      <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
      <span className="hidden md:inline" aria-hidden="true">
        Filtry
      </span>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger-strong px-1 text-micro font-bold text-on-brand ring-2 ring-surface md:static md:bg-brand md:px-1.5 md:ring-0"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
};
