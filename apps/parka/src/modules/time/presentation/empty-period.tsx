import { CalendarPlus, Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import type { TimeKind } from '../domain/models';
import { periodTitle } from '../domain/period-title';
import { useContext } from './context';
import { NEW_TASK_MODAL } from './modal-ids';

/** No tasks in the viewed period: names the period and offers the first one. */
export const EmptyPeriod = ({ kind }: { kind: TimeKind }) => {
  const { viewAnchor, isLoading } = useContext();
  // A reload may still bring tasks: claim emptiness only once it ends.
  if (isLoading) return null;
  return (
    <EmptyState
      data-e2e="time:empty"
      icon={CalendarPlus}
      title="Brak zadań"
      description={`Nic nie zaplanowano: ${periodTitle(kind, viewAnchor)}.`}
      action={
        <Button
          onClick={() => openModal(NEW_TASK_MODAL)}
          className="w-auto px-3 py-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj zadanie
        </Button>
      }
    />
  );
};
