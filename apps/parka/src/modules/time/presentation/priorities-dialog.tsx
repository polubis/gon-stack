import { ChevronRight, Flag, Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { useContext } from './context';
import { editPriorityModal, NEW_PRIORITY_MODAL } from './modal-ids';
import { ModalShell } from './modal-shell';
import { PriorityBadge } from './priority-badge';

/** Browse list of the priorities, same rows and actions as the categories list. */
export const PrioritiesDialog = ({ modal }: { modal: string }) => {
  const { priorities } = useContext();
  const add = (
    <Button
      onClick={() => openModal(NEW_PRIORITY_MODAL)}
      className="w-auto px-3 py-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
    </Button>
  );

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:priorities-dialog"
      title="Priorytety"
      description="Wszystkie priorytety zadań."
    >
      {priorities.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="Nie masz jeszcze priorytetów"
          description="Dodaj pierwszy priorytet zadań."
          action={add}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end">{add}</div>
          <ul className="max-h-80 overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-card">
            {priorities.map((p) => (
              <li key={p.id} className="border-b border-line last:border-0">
                <button
                  type="button"
                  aria-label={`Edytuj priorytet ${p.name}`}
                  onClick={() => openModal(editPriorityModal(p.id))}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                  <span className="min-w-0 flex-1">
                    <PriorityBadge priority={p} />
                  </span>
                  <ChevronRight
                    className="h-5 w-5 text-ink-soft"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </ModalShell>
  );
};
