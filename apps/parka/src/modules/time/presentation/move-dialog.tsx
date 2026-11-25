import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@repo/react-kit/cn';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { dayLabel } from '@/shared/date/date';
import { isDay } from '@/shared/period/period';
import { Button, Input } from '@/shared/ui/controls';
import { ModalFooter, MODAL_PADDING } from '@/shared/ui/modal-footer';
import type { BacklogTask, Task } from '../domain/models';
import {
  MOVE_CHOICES,
  MOVE_LABELS,
  moveTarget,
  type MoveChoice,
} from '../domain/move-options';
import { useContext } from './context';

/** `2026-10-30` as `pt. 30 paź`. */
const shortDay = (day: string): string => dayLabel(day, 'short', false);

/** Asks where to move a task: a step of a day, week or month, or a picked day. */
export const MoveDialog = ({
  modal,
  task,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  task: Task | BacklogTask;
}) => {
  useModalMounted(modal);
  const { now, updateTask, moveBacklogTask } = useContext();
  const board = 'day' in task ? task : null;
  const from = board ? board.day : now.day;
  const [choice, setChoice] = useState<MoveChoice>('next-day');
  const [custom, setCustom] = useState('');
  const target =
    choice === 'custom'
      ? isDay(custom)
        ? custom
        : null
      : moveTarget(choice, from);
  const close = () => closeModal(modal);
  const confirm = () => {
    if (target === null) return;
    const label = choice === 'custom' ? shortDay(target) : MOVE_LABELS[choice];
    close();
    if (board)
      updateTask(
        { ...board, day: target },
        `Przeniesiono „${task.title}” na ${label}.`,
      );
    else moveBacklogTask(task.id, target, label);
  };
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="time:move-dialog"
          className={`fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-md overflow-y-auto scroll-in-radius rounded-4xl border border-line bg-card ${MODAL_PADDING} focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2`}
        >
          <Dialog.Title className="text-base font-semibold">
            Przenieść zadanie?
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {`Wybierz, gdzie przenieść zadanie „${task.title}”.`}
          </Dialog.Description>
          <fieldset className="mt-3 min-w-0">
            <legend className="sr-only">Miejsce przeniesienia</legend>
            <div className="flex flex-col gap-2">
              {MOVE_CHOICES.map((value) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
                    value === choice
                      ? 'border-brand bg-brand-soft'
                      : 'border-line-strong hover:bg-hover-soft',
                  )}
                >
                  <input
                    type="radio"
                    name="move-choice"
                    value={value}
                    data-e2e={`time:move-option:${value}`}
                    checked={value === choice}
                    onChange={() => setChoice(value)}
                    className="mt-1 accent-brand"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {MOVE_LABELS[value][0]!.toUpperCase() +
                        MOVE_LABELS[value].slice(1)}
                    </span>
                    {value === 'custom' ? null : (
                      <span className="block text-xs text-ink-soft">
                        {shortDay(moveTarget(value, from))}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {choice === 'custom' ? (
            <Input
              type="date"
              data-e2e="time:move-date"
              aria-label="Wybrany dzień"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="mt-3"
            />
          ) : null}
          <ModalFooter className="flex justify-end gap-2">
            <Button variant="ghost" className="w-auto" onClick={close}>
              Anuluj
            </Button>
            <Button
              className="w-auto"
              data-e2e="time:move-confirm"
              disabled={target === null}
              onClick={confirm}
            >
              Przenieś
            </Button>
          </ModalFooter>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
