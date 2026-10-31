import { useState } from 'react';
import { closeModal } from '@/shared/router/modal-stack';
import { Button, Field } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { NAME_MAX_LENGTH } from '../configuration/constraints';
import type { AccessToken, TokenId } from '../domain/models';
import { useContext } from './context';
import { ModalShell } from './modal-shell';

/** New label of a token: comments written through it sign with this name. */
export const RenameDialog = ({
  modal,
  token,
}: {
  modal: string;
  token: AccessToken;
}) => {
  const ctx = useContext();
  const [name, setName] = useState(token.name);
  const trimmed = name.trim();
  const canSave = trimmed !== '' && trimmed !== token.name;

  return (
    <ModalShell
      modal={modal}
      data-e2e="access-tokens:rename-form"
      title="Nazwa tokenu"
      description="Pod tą nazwą asystent podpisuje komentarze do zadań."
    >
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) return;
          ctx.rename(token.id as TokenId, trimmed);
          closeModal(modal);
        }}
      >
        <Field label="Nazwa">
          <ClearableInput
            value={name}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="off"
            data-e2e="access-tokens:rename-name"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Button
          type="submit"
          data-e2e="access-tokens:rename-submit"
          disabled={!canSave}
        >
          Zapisz nazwę
        </Button>
      </form>
    </ModalShell>
  );
};
