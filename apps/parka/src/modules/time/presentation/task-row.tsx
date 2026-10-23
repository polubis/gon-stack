import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import type { Task } from '../domain/models';
import { useContext } from './context';
import { editTaskModal } from './modal-ids';
import { PriorityMark } from './priority-mark';
import { RecurringMark } from './recurring-mark';
import { stagger } from './stagger';
import { TaskMenu } from './task-menu';

type Props = {
  task: Task;
  /** Highlights the row of the current time. */
  now?: boolean;
  /** Entrance step; omit when a parent already animates the row. */
  step?: number;
};

/** Task line: done toggle, title (opens the editor), a muted meta line and a "more" menu. */
export const TaskRow = ({ task, now, step }: Props) => {
  const { categories, updateTask } = useContext();
  const category = categories.find((item) => item.id === task.categoryId);
  const Status = task.done ? CheckCircle2 : Circle;
  const hasMeta =
    task.at !== null ||
    task.inProgress ||
    task.recurringId !== null ||
    Boolean(category);
  return (
    <li
      aria-current={now ? 'time' : undefined}
      data-e2e={`time:task:${task.id}`}
      style={step === undefined ? undefined : stagger(step)}
      className={cn(
        'flex items-start gap-1 rounded-xl py-1 pl-1 pr-0.5 transition-colors hover:bg-hover-soft',
        step !== undefined && 'animate-item-in motion-reduce:animate-none',
        now && 'bg-brand-softer',
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Zrobione: ${task.title}`}
        data-e2e={`time:task-done:${task.id}`}
        onClick={() =>
          updateTask({ ...task, done: !task.done, inProgress: false })
        }
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Status
          className={cn('h-5 w-5', task.done ? 'text-brand' : 'text-ink-soft')}
          aria-hidden="true"
        />
      </button>
      <div className="flex min-w-0 flex-1 flex-col py-1.5">
        <button
          type="button"
          aria-label={`Edytuj zadanie: ${task.title}`}
          onClick={() => openModal(editTaskModal(task.id))}
          className={cn(
            'rounded-md text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            task.done && 'text-ink-soft line-through',
          )}
        >
          <span className="break-words">{task.title}</span>
        </button>
        {hasMeta ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
            {task.at !== null ? (
              <time className="tabular-nums">{task.at}</time>
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
            {task.inProgress ? (
              <span
                data-e2e={`time:task-progress-badge:${task.id}`}
                className="font-medium text-brand"
              >
                W trakcie
              </span>
            ) : null}
            {task.recurringId !== null ? <RecurringMark /> : null}
            <PriorityMark id={task.priorityId} />
          </p>
        ) : (
          <PriorityMark id={task.priorityId} />
        )}
      </div>
      <TaskMenu task={task} />
    </li>
  );
};
