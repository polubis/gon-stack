import { useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  CalendarArrowUp,
  Copy,
  Ellipsis,
  Inbox,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import type { BacklogTask, Task } from '../domain/models';
import { moveFocus } from './add-menu';
import { useContext } from './context';
import {
  deleteTaskModal,
  duplicateTaskModal,
  editBacklogModal,
  editTaskModal,
  moveTaskModal,
} from './modal-ids';
import { TaskDeviceBadge } from './task-device';

const ITEM =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** "More" popover of a task row: edit, duplicate, move, backlog, delete and where the task came from. */
export const TaskMenu = ({ task }: { task: Task | BacklogTask }) => {
  const { sendTaskToBacklog } = useContext();
  // A repeating task shows once per day: each row needs its own popover id.
  const { open, setOpen, openModal } = usePopoverOpen(
    `task-menu:${task.id}:${useId()}`,
  );
  const board = 'day' in task ? task : null;
  return (
    <Popover.Root modal open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-haspopup="menu"
        aria-label={`Więcej: ${task.title}`}
        data-e2e={`time:task-more:${task.id}`}
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
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
          className="z-(--z-popover) w-64 animate-pop-in rounded-2xl border border-line bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
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
              aria-label={
                board
                  ? `Edytuj zadanie: ${task.title}`
                  : `Edytuj zadanie z backlogu: ${task.title}`
              }
              data-e2e={`time:task-edit:${task.id}`}
              onClick={() =>
                openModal(
                  board ? editTaskModal(task.id) : editBacklogModal(task.id),
                )
              }
              className={ITEM}
            >
              <Pencil className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              Edytuj
            </button>
            <button
              type="button"
              role="menuitem"
              aria-label={`Duplikuj: ${task.title}`}
              data-e2e={`time:task-duplicate:${task.id}`}
              onClick={() => openModal(duplicateTaskModal(task.id))}
              className={ITEM}
            >
              <Copy className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              Duplikuj
            </button>
            <button
              type="button"
              role="menuitem"
              aria-label={`Przenieś: ${task.title}`}
              data-e2e={`time:task-move:${task.id}`}
              onClick={() => openModal(moveTaskModal(task.id))}
              className={ITEM}
            >
              <CalendarArrowUp
                className="h-4 w-4 text-ink-soft"
                aria-hidden="true"
              />
              Przenieś
            </button>
            {board && board.recurringId === null ? (
              <button
                type="button"
                role="menuitem"
                aria-label={`Wrzuć do backlogu: ${task.title}`}
                data-e2e={`time:task-backlog:${task.id}`}
                onClick={() => {
                  setOpen(false);
                  sendTaskToBacklog(board.id);
                }}
                className={ITEM}
              >
                <Inbox className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                Wrzuć do backlogu
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              aria-label={`Usuń: ${task.title}`}
              data-e2e={`time:task-delete:${task.id}`}
              onClick={() => {
                openModal(deleteTaskModal(task.id));
              }}
              className={ITEM}
            >
              <Trash2 className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              Usuń
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
