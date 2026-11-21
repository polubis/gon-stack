import { useId, useRef, type ComponentProps } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  closeModal,
  openModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';
import { DictationButton } from '@/shared/dictation/dictation-button';
import { ClearableTextarea } from './clearable';
import { Button, inputClass } from './controls';

type Props = Omit<ComponentProps<typeof ClearableTextarea>, 'onExpand'> & {
  /** URL modal id of the fullscreen editor, unique per field. */
  modal: string;
  /** Heading of the fullscreen editor. */
  title: string;
};

const FullscreenEditor = ({
  modal,
  title,
  value,
  maxLength,
  onChange,
}: Pick<Props, 'modal' | 'title' | 'value' | 'maxLength' | 'onChange'>) => {
  useModalMounted(modal);
  const counterId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const close = () => closeModal(modal);
  const text = String(value ?? '');
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
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            ref.current?.focus();
          }}
          className="fixed inset-0 bottom-[var(--kb-inset,0rem)] z-(--z-modal) flex animate-pop-in flex-col gap-3 bg-card p-4 focus:outline-none motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                {title}
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
            aria-label={`${title} w pełnym ekranie`}
            aria-describedby={counterId}
            value={value}
            maxLength={maxLength}
            onChange={onChange}
            className={cn(inputClass, 'min-h-0 flex-1 resize-none')}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DictationButton
                target={ref}
                label={`${title} w pełnym ekranie`}
              />
              {maxLength ? (
                <span
                  id={counterId}
                  className="text-xs tabular-nums text-ink-soft"
                >
                  {text.length}/{maxLength}
                  <span className="sr-only"> znaków</span>
                </span>
              ) : (
                <span id={counterId} className="sr-only">
                  {text.length} znaków
                </span>
              )}
            </div>
            <Button onClick={close} className="w-auto">
              Gotowe
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** `ClearableTextarea` with a fullscreen button; the editor stacks over the form (URL modal). */
export const ExpandableTextarea = ({ modal, title, ...props }: Props) => {
  const editing = useModalStack().includes(modal);
  return (
    <>
      <ClearableTextarea
        {...props}
        onExpand={() => openModal(modal)}
        expandLabel={`Edytuj na pełnym ekranie: ${title}`}
      />
      {editing ? (
        <FullscreenEditor
          modal={modal}
          title={title}
          value={props.value}
          maxLength={props.maxLength}
          onChange={props.onChange}
        />
      ) : null}
    </>
  );
};
