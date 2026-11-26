import * as Dialog from '@radix-ui/react-dialog';
import { useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { ModalFooter, MODAL_PADDING } from '@/shared/ui/modal-footer';

/** Remove confirmation stacked over the product popup (it stays mounted underneath). */
export const RemoveProductDialog = ({
  modal,
  name,
  onConfirm,
  onClose,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  name: string;
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
          data-e2e="expense-form:remove-product-dialog"
          className={`fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-w-md rounded-4xl border border-line bg-card ${MODAL_PADDING} focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2`}
        >
          <Dialog.Title className="text-base font-semibold">
            Usunąć produkt?
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {name.trim() === ''
              ? 'Produkt zniknie z tego wydatku.'
              : `Produkt „${name.trim()}” zniknie z tego wydatku.`}{' '}
            Wydatek zmieni się dopiero po zapisaniu.
          </Dialog.Description>
          <ModalFooter className="flex justify-end gap-2">
            <Button variant="ghost" className="w-auto" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-auto"
              data-e2e="expense-form:remove-product-confirm"
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
