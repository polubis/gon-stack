import {
  closeModal,
  closeModalThen,
  useModal,
} from '@/shared/router/modal-stack';
import { ConfirmDeleteDialog } from '@/modules/dashboard/presentation/confirm-delete-dialog';
import { DELETE_MODAL } from '../configuration/constraints';
import { useContext } from './context';

/** Confirmation of the bulk delete, opened from the actions menu through the URL. */
export const DeleteDialog = () => {
  const ctx = useContext();
  const count = ctx.useSelected().length;
  const { isOpen } = useModal(DELETE_MODAL);

  if (!isOpen) return null;
  return (
    <ConfirmDeleteDialog
      modal={DELETE_MODAL}
      title={
        count === 1
          ? 'Usunąć zaznaczone powiadomienie?'
          : `Usunąć zaznaczone powiadomienia (${count})?`
      }
      description="Usunięte powiadomienia znikną z listy bezpowrotnie."
      confirmLabel="Usuń"
      onClose={() => closeModal(DELETE_MODAL)}
      onConfirm={() => closeModalThen(DELETE_MODAL, ctx.deleteSelected)}
    />
  );
};
