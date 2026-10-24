import * as Dialog from '@radix-ui/react-dialog';
import { useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';

type Props = {
  /** Its id in the URL modal stack. */
  modal: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/** Confirmation for the actions that cannot be taken back. */
export const ConfirmDialog = ({
  modal,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: Props) => {
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
          data-e2e="access-tokens:confirm-dialog"
          className="fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-w-md animate-pop-in rounded-2xl bg-card p-4 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <Dialog.Title className="text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {description}
          </Dialog.Description>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" className="sm:w-auto" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="sm:w-auto"
              data-e2e="access-tokens:confirm"
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
