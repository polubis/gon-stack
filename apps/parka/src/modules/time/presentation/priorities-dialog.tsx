import { ChevronRight, Flag, Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  changeProps,
  useEntrance,
  useListChanges,
  type ChangePhase,
} from '@/shared/ui/list-changes';
import { cn } from '@repo/react-kit/cn';
import type { Priority } from '../domain/models';
import { useContext } from './context';
import { editPriorityModal, NEW_PRIORITY_MODAL } from './modal-ids';
import { ModalShell } from './modal-shell';
import { PriorityBadge } from './priority-badge';
import { stagger } from './stagger';

const PriorityRow = ({
  priority: p,
  phase,
  at,
}: {
  priority: Priority;
  phase: ChangePhase;
  at: number;
}) => {
  const change = changeProps(phase);
  const entrance = useEntrance(phase);
  return (
    <li
      aria-hidden={change['aria-hidden']}
      inert={change.inert}
      onAnimationEnd={entrance.onAnimationEnd}
      style={entrance.entering ? stagger(at) : undefined}
      className={cn(
        'border-b border-line last:border-0',
        entrance.entering && 'animate-item-in motion-reduce:animate-none',
        change.className,
      )}
    >
      <button
        type="button"
        aria-label={`Edytuj priorytet ${p.name}`}
        onClick={() => openModal(editPriorityModal(p.id))}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
      >
        <span className="min-w-0 flex-1">
          <PriorityBadge priority={p} />
        </span>
        <ChevronRight className="h-5 w-5 text-ink-soft" aria-hidden="true" />
      </button>
    </li>
  );
};

/** Browse list of the priorities, same rows and actions as the categories list. */
export const PrioritiesDialog = ({ modal }: { modal: string }) => {
  const { priorities, initializing } = useContext();
  const rows = useListChanges(priorities, (p) => p.id, String(initializing));
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
      {priorities.length === 0 && rows.length === 0 ? (
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
            {rows.map(({ key, item, phase, at }) => (
              <PriorityRow key={key} priority={item} phase={phase} at={at} />
            ))}
          </ul>
        </>
      )}
    </ModalShell>
  );
};
