import * as Dialog from '@radix-ui/react-dialog';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import type { Task } from '../domain/models';

type Titled = Pick<Task, 'title'>;

/** Destructive confirmation stacked over the task popup it came from. */
export const DeleteDialog = ({
  modal,
  task,
  onConfirm,
  title = 'Usunąć zadanie?',
  description = `Zadanie „${task.title}” zostanie usunięte bez możliwości cofnięcia.`,
  confirmLabel = 'Usuń',
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  task: Titled;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}) => {
  useModalMounted(modal);
  const close = () => closeModal(modal);
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
          data-e2e="time:delete-dialog"
          className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-w-md rounded-2xl bg-card p-4 focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <Dialog.Title className="text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {description}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" className="w-auto" onClick={close}>
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-auto"
              data-e2e="time:delete-confirm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
