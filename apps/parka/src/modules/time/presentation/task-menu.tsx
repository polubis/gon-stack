import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Ellipsis, Info, Play, Square } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import type { Task } from '../domain/models';
import { moveFocus } from './add-menu';
import { useContext } from './context';
import { viewTaskModal } from './modal-ids';
import { TaskDeviceBadge } from './task-device';

const ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** "More" popover of a task row: secondary actions and where the task came from. */
export const TaskMenu = ({ task }: { task: Task }) => {
  const { updateTask } = useContext();
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-haspopup="menu"
        aria-label={`Więcej: ${task.title}`}
        data-e2e={`time:task-more:${task.id}`}
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          open && 'bg-hover',
        )}
      >
        <Ellipsis className="h-5 w-5" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          collisionPadding={16}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement)
              .querySelector<HTMLElement>('[role="menuitem"]')
              ?.focus();
          }}
          className="z-(--z-modal) w-56 animate-pop-in rounded-xl border border-line-strong bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div
            role="menu"
            aria-label={`Więcej: ${task.title}`}
            onKeyDown={moveFocus}
            className="flex flex-col gap-1"
          >
            <button
              type="button"
              role="menuitem"
              aria-label={`Szczegóły zadania: ${task.title}`}
              data-e2e={`time:task-info:${task.id}`}
              onClick={() => {
                setOpen(false);
                openModal(viewTaskModal(task.id));
              }}
              className={ITEM}
            >
              <Info className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              Szczegóły
            </button>
            <button
              type="button"
              role="menuitem"
              aria-label={`${task.inProgress ? 'Wstrzymaj' : 'Rozpocznij'}: ${task.title}`}
              data-e2e={`time:task-progress:${task.id}`}
              onClick={() => {
                setOpen(false);
                updateTask({
                  ...task,
                  inProgress: !task.inProgress,
                  done: false,
                });
              }}
              className={ITEM}
            >
              {task.inProgress ? (
                <Square
                  className="h-4 w-4 text-brand"
                  fill="currentColor"
                  aria-hidden="true"
                />
              ) : (
                <Play className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              )}
              {task.inProgress ? 'Wstrzymaj' : 'Rozpocznij'}
            </button>
          </div>
          {task.device ? (
            <div className="mt-1 border-t border-line px-3 pt-2">
              <TaskDeviceBadge device={task.device} />
            </div>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
