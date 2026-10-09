import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/shared/ui/controls';

type Props = {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
};

export const DeleteDialog = ({ name, onConfirm, onClose }: Props) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
      <Dialog.Content
        data-e2e="categories:delete-dialog"
        className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-w-md rounded-2xl bg-card p-4 focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
      >
        <Dialog.Title className="text-base font-semibold">
          Usunąć kategorię „{name}”?
        </Dialog.Title>
        <Dialog.Description className="mt-1 text-sm text-ink-soft">
          Kategorii używanej przez wydatki lub limity nie da się usunąć.
          Najpierw przepnij wydatki na inne kategorie.
        </Dialog.Description>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" className="w-auto" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            variant="danger"
            className="w-auto"
            data-e2e="categories:delete-confirm"
            onClick={onConfirm}
          >
            Usuń
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
