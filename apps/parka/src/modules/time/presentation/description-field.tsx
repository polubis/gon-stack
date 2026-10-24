import { useId, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  closeModal,
  openModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Button, inputClass } from '@/shared/ui/controls';
import { TASK_DESCRIPTION_MAX_LENGTH } from '../configuration/constraints';
import { DESCRIPTION_EDITOR_MODAL } from './modal-ids';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const Counter = ({ id, value }: { id: string; value: string }) => (
  <span id={id} className="text-xs tabular-nums text-ink-soft">
    {value.length}/{TASK_DESCRIPTION_MAX_LENGTH}
    <span className="sr-only"> znaków</span>
  </span>
);

/** Stacked over the task form (URL modal): the same text, a whole screen to write in. */
const FullscreenEditor = ({ value, onChange }: Props) => {
  useModalMounted(DESCRIPTION_EDITOR_MODAL);
  const counterId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const close = () => closeModal(DESCRIPTION_EDITOR_MODAL);
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
          data-e2e="time:description-editor"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            ref.current?.focus();
          }}
          className="fixed inset-0 bottom-[var(--kb-inset,0rem)] z-(--z-modal) flex animate-pop-in flex-col gap-3 bg-card p-4 focus:outline-none motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                Opis zadania
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-ink-soft">
                Zmiany są od razu widoczne w formularzu.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Zamknij"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <textarea
            ref={ref}
            aria-label="Opis w pełnym ekranie"
            aria-describedby={counterId}
            value={value}
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, 'min-h-0 flex-1 resize-none')}
          />
          <div className="flex items-center justify-between gap-3">
            <Counter id={counterId} value={value} />
            <Button onClick={close} className="w-auto">
              Gotowe
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** Optional task notes: textarea with counter, clear button and a fullscreen editor. */
export const DescriptionField = ({ value, onChange }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const counterId = useId();
  const editing = useModalStack().includes(DESCRIPTION_EDITOR_MODAL);
  return (
    <div data-e2e="time:description-field">
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-ink-soft"
      >
        Opis (opcjonalnie)
      </label>
      <div className="relative">
        <textarea
          id={id}
          ref={ref}
          rows={3}
          value={value}
          maxLength={TASK_DESCRIPTION_MAX_LENGTH}
          aria-describedby={counterId}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dodatkowe informacje o zadaniu"
          className={cn(inputClass, 'max-h-48 resize-y pr-10')}
        />
        {value !== '' ? (
          <button
            type="button"
            aria-label="Wyczyść: Opis"
            onClick={() => {
              onChange('');
              ref.current?.focus();
            }}
            className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <Counter id={counterId} value={value} />
        <button
          type="button"
          data-e2e="time:description-expand"
          aria-label="Edytuj opis na pełnym ekranie"
          onClick={() => openModal(DESCRIPTION_EDITOR_MODAL)}
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {editing ? <FullscreenEditor value={value} onChange={onChange} /> : null}
    </div>
  );
};
