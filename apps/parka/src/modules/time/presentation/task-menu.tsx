import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  CalendarArrowUp,
  CalendarDays,
  CalendarPlus,
  Ellipsis,
  Inbox,
  Sun,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { Input } from '@/shared/ui/controls';
import { addDays, isDay } from '@/shared/period/period';
import type { BacklogTask, Task } from '../domain/models';
import { weekDays } from '../domain/schedule';
import { moveFocus } from './add-menu';
import { useContext } from './context';
import { deleteTaskModal } from './modal-ids';
import { TaskDeviceBadge } from './task-device';

const ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** `YYYY-MM-DD` as `DD.MM`. */
const shortDay = (day: string): string => `${day.slice(8)}.${day.slice(5, 7)}`;

type Target = { day: string; label: string; text: string; Icon: LucideIcon };

/** "More" popover of a task row: quick moves, backlog, delete and where the task came from. */
export const TaskMenu = ({ task }: { task: Task | BacklogTask }) => {
  const { now, updateTask, moveBacklogTask, sendTaskToBacklog } = useContext();
  const [open, setOpen] = useState(false);
  const board = 'day' in task ? task : null;
  const targets: Target[] = [
    { day: now.day, label: 'dziś', text: 'Przenieś na dziś', Icon: Sun },
    {
      day: addDays(now.day, 1),
      label: 'jutro',
      text: 'Przenieś na jutro',
      Icon: CalendarArrowUp,
    },
    {
      day: addDays(weekDays(now.day)[0]!, 7),
      label: 'następny tydzień',
      text: 'Przenieś na następny tydzień',
      Icon: CalendarPlus,
    },
  ].filter(({ day }) => (board ? day !== board.day && day !== now.day : true));
  const move = (day: string, label: string) => {
    setOpen(false);
    if (board)
      updateTask(
        { ...board, day },
        `Przeniesiono „${task.title}” na ${label}.`,
      );
    else moveBacklogTask(task.id, day, label);
  };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
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
          className="z-(--z-modal) w-64 animate-pop-in rounded-xl border border-line-strong bg-card p-2 shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div
            role="menu"
            aria-label={`Więcej: ${task.title}`}
            onKeyDown={moveFocus}
            className="flex flex-col gap-1"
          >
            {targets.map(({ day, label, text, Icon }) => (
              <button
                key={day}
                type="button"
                role="menuitem"
                aria-label={`${text}: ${task.title}`}
                data-e2e={`time:task-move:${task.id}`}
                onClick={() => move(day, label)}
                className={ITEM}
              >
                <Icon className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                {text}
              </button>
            ))}
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
                setOpen(false);
                openModal(deleteTaskModal(task.id));
              }}
              className={ITEM}
            >
              <Trash2 className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              Usuń
            </button>
          </div>
          {board ? null : (
            <div className="mt-1 flex items-center gap-3 border-t border-line px-3 pt-2 text-sm">
              <CalendarDays
                className="h-4 w-4 shrink-0 text-ink-soft"
                aria-hidden="true"
              />
              <Input
                type="date"
                data-e2e={`time:task-date:${task.id}`}
                aria-label={`Przenieś na wybrany dzień: ${task.title}`}
                value=""
                min={now.day}
                onChange={(e) => {
                  const day = e.target.value;
                  if (isDay(day)) move(day, shortDay(day));
                }}
                className="h-9 min-w-0 flex-1 rounded-lg px-3 py-0 text-xs"
              />
            </div>
          )}
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
