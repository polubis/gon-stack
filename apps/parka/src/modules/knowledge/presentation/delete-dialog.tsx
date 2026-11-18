import * as Dialog from '@radix-ui/react-dialog';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { MODAL_PADDING, ModalFooter } from '@/shared/ui/modal-footer';

/** Destructive confirmation, stacked over the popup it came from. */
export const DeleteDialog = ({
  modal,
  title,
  description,
  onConfirm,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  title: string;
  description: string;
  onConfirm: () => void;
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
          data-e2e="knowledge:delete-dialog"
          className={`fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-w-md rounded-4xl border border-line bg-card ${MODAL_PADDING} focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2`}
        >
          <Dialog.Title className="text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {description}
          </Dialog.Description>
          <ModalFooter className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto"
              data-e2e="knowledge:delete-cancel"
              onClick={close}
            >
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-auto"
              data-e2e="knowledge:delete-confirm"
              onClick={onConfirm}
            >
              Usuń
            </Button>
          </ModalFooter>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
