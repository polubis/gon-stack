import { closeModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import type { KnowledgeNode } from '../domain/models';
import { ModalFrame } from './modal-frame';

/** Destructive confirmation of a node. */
export const DeleteDialog = ({
  modal,
  node,
  onConfirm,
}: {
  modal: string;
  node: KnowledgeNode;
  onConfirm: () => void;
}) => (
  <ModalFrame
    modal={modal}
    data-e2e="knowledge:delete-dialog"
    title="Usunąć węzeł?"
    description={`Węzeł „${node.title}” zostanie usunięty bez możliwości cofnięcia.`}
    footer={
      <>
        <Button
          variant="ghost"
          data-e2e="knowledge:delete-cancel"
          onClick={() => closeModal(modal)}
        >
          Anuluj
        </Button>
        <Button
          variant="danger"
          data-e2e="knowledge:delete-confirm"
          onClick={() => {
            onConfirm();
            closeModal(modal);
          }}
        >
          Usuń
        </Button>
      </>
    }
  >
    <p className="text-sm text-ink-soft">
      Wiedza z tego węzła przestanie zapełniać obszar mózgu przypisany do
      folderu.
    </p>
  </ModalFrame>
);
