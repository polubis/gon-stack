import { Trash2 } from 'lucide-react';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { ModalFooter } from '@/shared/ui/modal-footer';
import type { KnowledgeE2eId } from '../configuration/e2e-ids';
import { deleteModal, type Entity } from './modal-ids';

/** Sticky footer of every form: optional delete (confirmation), cancel, save. */
export const FormFooter = ({
  modal,
  entity,
  editId,
}: {
  modal: string;
  entity: Exclude<Entity, 'reel'>;
  /** Id of the item being edited; omitted when adding. */
  editId?: string;
}) => (
  <ModalFooter className="flex flex-wrap items-center gap-2">
    {editId ? (
      <Button
        variant="danger"
        data-e2e={`knowledge:${entity}-delete` as KnowledgeE2eId}
        onClick={() => openModal(deleteModal(entity, editId))}
        className="w-auto"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Usuń
      </Button>
    ) : null}
    <div className="ml-auto flex flex-wrap justify-end gap-2">
      <Button
        variant="ghost"
        data-e2e={`knowledge:${entity}-cancel` as KnowledgeE2eId}
        onClick={() => closeModal(modal)}
        className="w-auto"
      >
        Anuluj
      </Button>
      <Button
        type="submit"
        data-e2e={`knowledge:${entity}-save` as KnowledgeE2eId}
        className="w-auto"
      >
        {editId ? 'Zapisz' : 'Dodaj'}
      </Button>
    </div>
  </ModalFooter>
);
