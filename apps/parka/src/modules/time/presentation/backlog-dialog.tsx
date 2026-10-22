import { Inbox, Info, Plus, Trash2 } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button, Input } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { addDays, isDay } from '@/shared/period/period';
import { Skeleton } from '@/shared/ui/skeleton';
import { SKELETON_ROWS } from '../configuration/constraints';
import type { BacklogTask } from '../domain/models';
import { useContext } from './context';
import {
  deleteTaskModal,
  editBacklogModal,
  NEW_BACKLOG_MODAL,
  viewTaskModal,
} from './modal-ids';
import { ModalShell } from './modal-shell';
import { PriorityMark } from './priority-mark';

const MOVE_BUTTON =
  'inline-flex h-9 items-center rounded-full border border-line-strong px-3 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const rows = Array.from({ length: SKELETON_ROWS }, (_, i) => i);

/** `YYYY-MM-DD` as `DD.MM`. */
const shortDay = (day: string): string => `${day.slice(8)}.${day.slice(5, 7)}`;

const Row = ({ task }: { task: BacklogTask }) => {
  const { categories, now, anchor, moveBacklogTask } = useContext();
  const category = categories.find((item) => item.id === task.categoryId);
  const tomorrow = addDays(now.day, 1);
  const targets = [
    { day: now.day, label: 'dziś', text: 'Dziś' },
    { day: tomorrow, label: 'jutro', text: 'Jutro' },
    // The day the board is showing, when it is neither of the above.
    ...(anchor !== now.day && anchor !== tomorrow
      ? [{ day: anchor, label: shortDay(anchor), text: shortDay(anchor) }]
      : []),
  ];
  return (
    <li
      data-e2e={`time:backlog-task:${task.id}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line p-3"
    >
      {category ? (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
          title={category.name}
          aria-hidden="true"
        />
      ) : null}
      <button
        type="button"
        data-e2e={`time:backlog-edit:${task.id}`}
        aria-label={`Edytuj zadanie z backlogu: ${task.title}`}
        onClick={() => openModal(editBacklogModal(task.id))}
        className="min-w-24 flex-1 rounded-md text-left text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="break-words">{task.title}</span>
      </button>
      <button
        type="button"
        aria-label={`Szczegóły zadania: ${task.title}`}
        data-e2e={`time:task-info:${task.id}`}
        onClick={() => openModal(viewTaskModal(task.id))}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
      <PriorityMark id={task.priorityId} />
      <div className="flex w-full flex-wrap items-center gap-1.5">
        {targets.map(({ day, label, text }) => (
          <button
            key={day}
            type="button"
            data-e2e={`time:backlog-move:${task.id}`}
            aria-label={`Przenieś na ${label}: ${task.title}`}
            onClick={() => moveBacklogTask(task.id, day, label)}
            className={MOVE_BUTTON}
          >
            {text}
          </button>
        ))}
        <Input
          type="date"
          data-e2e={`time:backlog-date:${task.id}`}
          aria-label={`Przenieś na wybrany dzień: ${task.title}`}
          value=""
          min={now.day}
          onChange={(e) => {
            const day = e.target.value;
            if (isDay(day)) moveBacklogTask(task.id, day, shortDay(day));
          }}
          className="h-9 w-auto min-w-0 flex-1 rounded-full px-3 py-0 text-xs"
        />
        <button
          type="button"
          data-e2e={`time:backlog-delete:${task.id}`}
          aria-label={`Usuń z backlogu: ${task.title}`}
          onClick={() => openModal(deleteTaskModal(task.id))}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
};

/** Tasks without a day; one click on a day button puts a task on the board. */
export const BacklogDialog = ({ modal }: { modal: string }) => {
  const { backlog, initializing } = useContext();
  return (
    <ModalShell
      modal={modal}
      data-e2e="time:backlog-dialog"
      title="Backlog"
      description="Zadania bez terminu. Jedno kliknięcie przenosi zadanie na tablicę."
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
            <ul className="flex max-h-[60dvh] flex-col gap-2 overflow-y-auto py-0.5 pr-2">
              {backlog.map((task) => (
                <Row key={task.id} task={task} />
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
