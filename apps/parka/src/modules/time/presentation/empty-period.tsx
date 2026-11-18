import { CalendarPlus, FilterX, Plus, SlidersHorizontal } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  activeFilterCount,
  describeFilters,
  NO_FILTERS,
} from '../domain/filters';
import type { TimeKind } from '../domain/models';
import { periodTitle } from '../domain/period-title';
import { useContext } from './context';
import { NEW_TASK_MODAL } from './modal-ids';

/** No tasks in the viewed period: names the period (and the filters) and offers a way on. */
export const EmptyPeriod = ({ kind }: { kind: TimeKind }) => {
  const { anchor, isLoading, filters, setFilters, categories, priorities } =
    useContext();
  // A reload may still bring tasks: claim emptiness only once it ends.
  if (isLoading) return null;
  const addButton = (
    <Button
      data-e2e="time:empty-add"
      onClick={() => openModal(NEW_TASK_MODAL)}
      className="w-auto px-3 py-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
    </Button>
  );
  if (activeFilterCount(filters) > 0)
    return (
      <EmptyState
        data-e2e="time:empty-filters"
        icon={FilterX}
        title={`Brak wyników: ${describeFilters(filters, categories, priorities)}`}
        description={`Nic nie pasuje do filtrów: ${periodTitle(kind, anchor)}. Zmniejsz filtry albo dodaj zadanie.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="ghost"
              data-e2e="time:empty-clear-filters"
              onClick={() => setFilters({ ...NO_FILTERS, sort: filters.sort })}
              className="w-auto px-3 py-2"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />{' '}
              Wyczyść
            </Button>
            {addButton}
          </div>
        }
      />
    );
  return (
    <EmptyState
      data-e2e="time:empty"
      icon={CalendarPlus}
      title="Brak zadań"
      description={`Nic nie zaplanowano: ${periodTitle(kind, anchor)}.`}
      action={addButton}
    />
  );
};
