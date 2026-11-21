import {
  Check,
  ChevronsRight,
  Eye,
  Play,
  RotateCcw,
  SquareDashed,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import {
  changeProps,
  useEntrance,
  type ChangePhase,
} from '@/shared/ui/list-changes';
import type { BacklogTask, Status, Task } from '../domain/models';
import {
  IN_PROGRESS,
  nextStep,
  progress,
  stepName,
  stepOf,
  withStep,
  type Step,
} from '../domain/status';
import { useContext } from './context';
import { viewTaskModal } from './modal-ids';
import { PriorityBadge } from './priority-badge';
import { RecurringMark } from './recurring-mark';
import { stagger } from './stagger';
import { TaskKey } from './task-key';
import { TaskMenu } from './task-menu';

type Props = {
  task: Task | BacklogTask;
  /** Highlights the row of the current time. */
  now?: boolean;
  /** Entrance step; omit when a parent already animates the row. */
  step?: number;
  /** What just happened to the row: created, updated or leaving. */
  phase?: ChangePhase;
};

/** The next step of the user's workflow; after the last one (done) the task is reopened. */
const advance = (
  task: Task,
  statuses: Status[],
): { task: Task; message: string } => {
  const step = nextStep(task, statuses);
  return {
    task: withStep(task, step),
    message: `Zadanie: ${stepName(step, statuses)}.`,
  };
};

const StepIcon = ({ step, ...rest }: { step: Step } & LucideProps) =>
  step === 'open' ? (
    <SquareDashed {...rest} />
  ) : step === 'done' ? (
    <Check {...rest} />
  ) : step === IN_PROGRESS ? (
    <Play {...rest} />
  ) : (
    <Eye {...rest} />
  );

/** Task line: title (opens details), a muted meta line, a button to the next step and a "more" menu with edit. Backlog tasks have no status. */
export const TaskRow = ({ task, now, step, phase = 'idle' }: Props) => {
  const { categories, priorities, statuses, updateTask } = useContext();
  const board = 'day' in task ? task : null;
  const category = categories.find((item) => item.id === task.categoryId);
  const priority = priorities.find((item) => item.id === task.priorityId);
  const change = changeProps(phase);
  const entrance = useEntrance(phase, step !== undefined);
  const current = board ? stepOf(board) : null;
  const position = current ? progress(current, statuses) : null;
  const started = current !== null && current !== 'open' && current !== 'done';
  return (
    <li
      aria-current={now ? 'time' : undefined}
      data-started={started ? '' : undefined}
      data-e2e={`time:task:${task.id}`}
      aria-hidden={change['aria-hidden']}
      inert={change.inert}
      onAnimationEnd={entrance.onAnimationEnd}
      style={
        entrance.entering && step !== undefined ? stagger(step) : undefined
      }
      className={cn(
        'relative flex items-start gap-0.5 rounded-2xl pb-1.5 pt-1 pl-3 pr-0.5 transition-colors duration-200 hover:bg-hover-soft motion-reduce:transition-none',
        entrance.entering && 'animate-item-in motion-reduce:animate-none',
        change.className,
        now && 'bg-accent-soft',
      )}
    >
      {started ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2.5 left-1 w-0.5 animate-item-in rounded-full bg-brand/50 motion-reduce:animate-none"
        />
      ) : null}
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
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
          <TaskKey taskKey={task.key} data-e2e={`time:task-key:${task.id}`} />
          {board?.at != null ? (
            <time className="rounded-full bg-hover px-2 py-0.5 font-medium tabular-nums text-ink">
              {board.at}
            </time>
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
          {current && position ? (
            <span
              key={current}
              data-e2e={`time:task-step:${task.id}`}
              className="inline-flex animate-item-in items-center gap-1 font-semibold text-ink motion-reduce:animate-none"
            >
              <StepIcon
                step={current}
                className="h-3 w-3 shrink-0"
                aria-hidden="true"
              />
              <span className="tabular-nums">
                {position.at}/{position.total}
              </span>
              <span>{stepName(current, statuses)}</span>
            </span>
          ) : null}
          {board?.recurringId != null ? <RecurringMark /> : null}
          {priority ? <PriorityBadge priority={priority} compact /> : null}
        </p>
      </div>
      {board && current ? (
        <button
          type="button"
          aria-label={
            board.done
              ? `Otwórz ponownie: ${task.title}`
              : `Następny krok: ${task.title}`
          }
          title={
            board.done
              ? 'Otwórz ponownie'
              : `Następny krok: ${stepName(nextStep(board, statuses), statuses)}`
          }
          data-e2e={`time:task-advance:${task.id}`}
          onClick={() => {
            const next = advance(board, statuses);
            updateTask(next.task, next.message);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {board.done ? (
            <RotateCcw
              key="reopen"
              className="h-4 w-4 animate-item-in motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <ChevronsRight
              key="next"
              className="h-4.5 w-4.5 animate-item-in motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
        </button>
      ) : null}
      <TaskMenu task={task} />
    </li>
  );
};
