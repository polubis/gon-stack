import {
  BrainCircuit,
  FilterX,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { periodLabel } from '@/shared/period-control/domain/format';
import {
  activeFilterCount,
  describeFilters,
  NO_FILTERS,
} from '../domain/filters';
import { useContext } from './context';
import { newModal } from './modal-ids';

/** Nothing stored yet: offers the sample course or a first topic. */
export const EmptyKnowledge = () => {
  const { loadDemo, demoBusy } = useContext();
  return (
    <EmptyState
      data-e2e="knowledge:empty"
      icon={BrainCircuit}
      title="Nie masz jeszcze wiedzy"
      description="Wczytaj kurs demo albo dodaj pierwszy temat."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            data-e2e="knowledge:empty-demo"
            disabled={demoBusy}
            aria-busy={demoBusy}
            onClick={loadDemo}
            className="w-auto px-3 py-2"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {demoBusy ? 'Wczytuję…' : 'Wczytaj'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => openModal(newModal('topic'))}
            className="w-auto px-3 py-2"
          >
            <Plus className="size-4" aria-hidden="true" /> Dodaj
          </Button>
        </div>
      }
    />
  );
};

/** No topics in the viewed period: names the period (and the filters) and offers a way on. */
export const EmptyPeriod = () => {
  const { period, filters, setFilters, categories, catalogs, tags, isLoading } =
    useContext();
  // A reload may still bring topics: claim emptiness only once it ends.
  if (isLoading) return null;
  if (activeFilterCount(filters) > 0)
    return (
      <EmptyState
        data-e2e="knowledge:empty-filters"
        icon={FilterX}
        title={`Brak wyników dla ${describeFilters(filters, categories, catalogs, tags)}`}
        description={`Nic nie pasuje do filtrów: ${periodLabel(period)}. Zmniejsz filtry albo dodaj temat.`}
        action={
          <Button
            variant="ghost"
            data-e2e="knowledge:empty-clear-filters"
            onClick={() => setFilters(NO_FILTERS)}
            className="w-auto px-3 py-2"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Wyczyść
            filtry
          </Button>
        }
      />
    );
  return (
    <EmptyState
      data-e2e="knowledge:empty-period"
      icon={BrainCircuit}
      title="Brak tematów w tym okresie"
      description={`Nic nie zaplanowano: ${periodLabel(period)}. Dodaj temat albo sprawdź backlog.`}
      action={
        <Button
          onClick={() => openModal(newModal('topic'))}
          className="w-auto px-3 py-2"
        >
          <Plus className="size-4" aria-hidden="true" /> Dodaj
        </Button>
      }
    />
  );
};
