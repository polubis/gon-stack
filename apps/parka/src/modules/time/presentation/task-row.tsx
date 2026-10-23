import { CheckCircle2, Circle, Info, Play } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import type { Task } from '../domain/models';
import { useContext } from './context';
import { editTaskModal, viewTaskModal } from './modal-ids';
import { PriorityMark } from './priority-mark';
import { RecurringMark } from './recurring-mark';
import { stagger } from './stagger';
import { TaskDeviceBadge } from './task-device';

type Props = {
  task: Task;
  /** Highlights the row of the current time. */
  now?: boolean;
  /** Entrance step; omit when a parent already animates the row. */
  step?: number;
};

/** Task line: done toggle, title (opens the editor), time, priority and category. */
export const TaskRow = ({ task, now, step }: Props) => {
  const { categories, updateTask } = useContext();
  const category = categories.find((item) => item.id === task.categoryId);
  const Status = task.done ? CheckCircle2 : Circle;
  return (
    <li
      aria-current={now ? 'time' : undefined}
      data-e2e={`time:task:${task.id}`}
      style={step === undefined ? undefined : stagger(step)}
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border p-3',
        step !== undefined && 'animate-item-in motion-reduce:animate-none',
        now ? 'border-brand bg-brand-softer' : 'border-line',
        task.inProgress && 'border-l-4 border-l-brand',
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
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Status
          className={cn('h-5 w-5', task.done ? 'text-brand' : 'text-ink-soft')}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        aria-label={`Edytuj zadanie: ${task.title}`}
        onClick={() => openModal(editTaskModal(task.id))}
        className={cn(
          'min-w-24 flex-1 rounded-md text-left text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          task.done && 'text-ink-soft line-through',
        )}
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
      <button
        type="button"
        aria-pressed={task.inProgress}
        aria-label={`W trakcie: ${task.title}`}
        data-e2e={`time:task-progress:${task.id}`}
        onClick={() =>
          updateTask({ ...task, inProgress: !task.inProgress, done: false })
        }
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          task.inProgress ? 'text-brand' : 'text-ink-soft',
        )}
      >
        <Play
          className="h-4 w-4"
          fill={task.inProgress ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>
      {task.inProgress ? (
        <span
          data-e2e={`time:task-progress-badge:${task.id}`}
          className="shrink-0 rounded-full bg-brand-softer px-2 py-0.5 text-xs font-medium text-brand"
        >
          W trakcie
        </span>
      ) : null}
      {task.recurringId !== null ? <RecurringMark /> : null}
      {task.device ? <TaskDeviceBadge device={task.device} /> : null}
      <PriorityMark id={task.priorityId} />
      {task.at !== null ? (
        <time className="shrink-0 text-xs tabular-nums text-ink-soft">
          {task.at}
        </time>
      ) : null}
      {category ? (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
          title={category.name}
          aria-hidden="true"
        />
      ) : null}
    </li>
  );
};
