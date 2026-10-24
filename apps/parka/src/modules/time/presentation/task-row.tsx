import { CheckCircle2, Circle, LoaderCircle, Pencil } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import type { BacklogTask, Task } from '../domain/models';
import { useContext } from './context';
import { editBacklogModal, editTaskModal, viewTaskModal } from './modal-ids';
import { PriorityMark } from './priority-mark';
import { RecurringMark } from './recurring-mark';
import { stagger } from './stagger';
import { TaskMenu } from './task-menu';

type Props = {
  task: Task | BacklogTask;
  /** Highlights the row of the current time. */
  now?: boolean;
  /** Entrance step; omit when a parent already animates the row. */
  step?: number;
};

/** Todo, then in progress, then done, then todo again. */
const nextStatus = (task: Task): { task: Task; message: string } =>
  task.done
    ? {
        task: { ...task, done: false, inProgress: false },
        message: 'Zadanie do zrobienia.',
      }
    : task.inProgress
      ? {
          task: { ...task, done: true, inProgress: false },
          message: 'Zadanie zrobione.',
        }
      : {
          task: { ...task, inProgress: true },
          message: 'Zadanie w trakcie.',
        };

/** Task line: status cycle, title (opens details), a muted meta line, edit and a "more" menu. Backlog tasks have no status. */
export const TaskRow = ({ task, now, step }: Props) => {
  const { categories, updateTask } = useContext();
  const board = 'day' in task ? task : null;
  const category = categories.find((item) => item.id === task.categoryId);
  const hasMeta =
    board?.at != null ||
    board?.inProgress ||
    board?.recurringId != null ||
    Boolean(category);
  return (
    <li
      aria-current={now ? 'time' : undefined}
      data-e2e={`time:task:${task.id}`}
      style={step === undefined ? undefined : stagger(step)}
      className={cn(
        'flex items-start gap-0.5 rounded-xl py-1 pl-1 pr-0.5 transition-colors hover:bg-hover-soft',
        step !== undefined && 'animate-item-in motion-reduce:animate-none',
        now && 'bg-brand-softer',
      )}
    >
      {board ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={board.done ? true : board.inProgress ? 'mixed' : false}
          aria-label={`Zrobione: ${task.title}`}
          data-e2e={`time:task-done:${task.id}`}
          onClick={() => {
            const next = nextStatus(board);
            updateTask(next.task, next.message);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {board.done ? (
            <CheckCircle2 className="h-5 w-5 text-brand" aria-hidden="true" />
          ) : board.inProgress ? (
            <LoaderCircle
              className="h-5 w-5 animate-spin text-brand motion-reduce:animate-none"
              strokeWidth={3}
              aria-hidden="true"
            />
          ) : (
            <Circle className="h-5 w-5 text-ink-soft" aria-hidden="true" />
          )}
        </button>
      ) : (
        <span className="w-2 shrink-0" aria-hidden="true" />
      )}
      <div className="flex min-w-0 flex-1 flex-col py-1.5">
        <button
          type="button"
          aria-label={`Szczegóły zadania: ${task.title}`}
          data-e2e={`time:task-info:${task.id}`}
          onClick={() => openModal(viewTaskModal(task.id))}
          className={cn(
            'rounded-md text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            board?.done && 'text-ink-soft line-through',
          )}
        >
          <span className="break-words">{task.title}</span>
        </button>
        {hasMeta ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
            {board?.at != null ? (
              <time className="tabular-nums">{board.at}</time>
            ) : null}
            {category ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{category.name}</span>
              </span>
            ) : null}
            {board?.inProgress ? (
              <span
                data-e2e={`time:task-progress-badge:${task.id}`}
                className="font-medium text-brand"
              >
                W trakcie
              </span>
            ) : null}
            {board?.recurringId != null ? <RecurringMark /> : null}
            <PriorityMark id={task.priorityId} />
          </p>
        ) : (
          <PriorityMark id={task.priorityId} />
        )}
      </div>
      <button
        type="button"
        aria-label={
          board
            ? `Edytuj zadanie: ${task.title}`
            : `Edytuj zadanie z backlogu: ${task.title}`
        }
        data-e2e={`time:task-edit:${task.id}`}
        onClick={() =>
          openModal(board ? editTaskModal(task.id) : editBacklogModal(task.id))
        }
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <TaskMenu task={task} />
    </li>
  );
};
