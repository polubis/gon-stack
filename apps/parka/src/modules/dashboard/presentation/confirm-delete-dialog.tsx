import * as Dialog from '@radix-ui/react-dialog';
import { useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';

/**
 * Delete confirmation stacked over the popup it came from (the popup stays
 * mounted underneath). Says plainly what will and will not be deleted.
 */
export const ConfirmDeleteDialog = ({
  modal,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  useModalMounted(modal);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="dashboard:delete-dialog"
          className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-w-md rounded-2xl bg-card p-4 focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <Dialog.Title className="text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description
            className="mt-1 text-sm text-ink-soft"
            data-e2e="dashboard:delete-scope"
          >
            {description}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" className="w-auto" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-auto"
              data-e2e="dashboard:delete-confirm"
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
