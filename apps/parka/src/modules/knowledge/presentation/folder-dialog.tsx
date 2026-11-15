import { useState, type FormEvent } from 'react';
import { closeModal } from '@/shared/router/modal-stack';
import { Button, Field, Select } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { FOLDER_NAME_MAX_LENGTH } from '../configuration/constraints';
import { BRAIN_AREAS, type BrainAreaId } from '../domain/brain-area';
import { newFolderId } from '../domain/ids';
import { useContext } from './context';
import { ModalFrame } from './modal-frame';
import { NEW_FOLDER_MODAL } from './modal-ids';

const FORM = 'knowledge-folder-form';

/** New folder: a name and the brain area it lives in. */
export const FolderDialog = () => {
  const { createFolder } = useContext();
  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState<BrainAreaId>('frontal');
  const valid = name.trim() !== '';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    createFolder({ id: newFolderId(), name: name.trim(), areaId });
    closeModal(NEW_FOLDER_MODAL);
  };

  return (
    <ModalFrame
      modal={NEW_FOLDER_MODAL}
      data-e2e="knowledge:folder-dialog"
      title="Nowy folder"
      description="Folder grupuje wiedzę i wskazuje obszar mózgu, w którym ona mieszka."
      footer={
        <>
          <Button
            variant="ghost"
            data-e2e="knowledge:folder-cancel"
            onClick={() => closeModal(NEW_FOLDER_MODAL)}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            form={FORM}
            disabled={!valid}
            data-e2e="knowledge:folder-save"
            className="disabled:opacity-50"
          >
            Dodaj folder
          </Button>
        </>
      }
    >
      <form
        id={FORM}
        onSubmit={submit}
        data-e2e="knowledge:folder-form"
        className="flex flex-col gap-4"
      >
        <Field label="Nazwa" required>
          <ClearableInput
            data-e2e="knowledge:folder-name"
            value={name}
            maxLength={FOLDER_NAME_MAX_LENGTH}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field
          label="Obszar mózgu"
          required
          hint={BRAIN_AREAS.find((a) => a.id === areaId)?.role}
        >
          <Select
            data-e2e="knowledge:folder-area"
            value={areaId}
            onValueChange={(value) => setAreaId(value as BrainAreaId)}
            options={BRAIN_AREAS.map((a) => ({ value: a.id, label: a.name }))}
          />
        </Field>
      </form>
    </ModalFrame>
  );
};
