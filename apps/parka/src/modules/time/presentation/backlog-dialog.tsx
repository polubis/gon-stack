import { Inbox, Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { SKELETON_ROWS } from '../configuration/constraints';
import { useContext } from './context';
import { NEW_BACKLOG_MODAL } from './modal-ids';
import { ModalShell } from './modal-shell';
import { TaskRow } from './task-row';

const rows = Array.from({ length: SKELETON_ROWS }, (_, i) => i);

/** Tasks without a day; the row menu puts a task on a day. */
export const BacklogDialog = ({ modal }: { modal: string }) => {
  const { backlog, initializing } = useContext();
  return (
    <ModalShell
      modal={modal}
      data-e2e="time:backlog-dialog"
      title="Backlog"
      description="Zadania bez terminu. Przenieś zadanie na wybrany dzień z menu „Więcej”."
    >
      <div className="flex flex-col gap-3">
        {initializing ? (
          <ul
            data-e2e="time:backlog-skeleton"
            aria-busy="true"
            className="flex flex-col gap-2"
          >
            {rows.map((i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-line p-3"
              >
                <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-9 w-16 shrink-0 rounded-full" />
              </li>
            ))}
          </ul>
        ) : backlog.length === 0 ? (
          <EmptyState
            data-e2e="time:backlog-empty"
            icon={Inbox}
            title="Backlog jest pusty"
            description="Zapisuj tu zadania bez terminu, a potem przenoś je na wybrany dzień."
            action={
              <Button
                onClick={() => openModal(NEW_BACKLOG_MODAL)}
                className="w-auto px-3 py-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj do
                backlogu
              </Button>
            }
          />
        ) : (
          <>
            <ul className="flex flex-col">
              {backlog.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
            <Button
              data-e2e="time:backlog-add"
              onClick={() => openModal(NEW_BACKLOG_MODAL)}
              className="w-auto self-end px-3 py-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj do backlogu
            </Button>
          </>
        )}
      </div>
    </ModalShell>
  );
};
