import { useState, type FormEvent } from 'react';
import { closeModal } from '@/shared/router/modal-stack';
import { ClearableInput } from '@/shared/ui/clearable';
import { Field } from '@/shared/ui/controls';
import { TAG_MAX_LENGTH } from '../configuration/constraints';
import type { Tag } from '../domain/models';
import { useContext } from './context';
import { FieldError } from './field-error';
import { FormFooter } from './form-footer';
import { ModalShell } from './modal-shell';

/** Tag form: a short name. Edits when `tag` is given. */
export const TagDialog = ({ modal, tag }: { modal: string; tag?: Tag }) => {
  const { tags, createTag, updateTag } = useContext();
  const [name, setName] = useState(tag?.name ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const trimmed = name.trim();
  const nameError = !trimmed
    ? 'Podaj nazwę tagu.'
    : tags.some(
          (t) =>
            t.id !== tag?.id && t.name.toLowerCase() === trimmed.toLowerCase(),
        )
      ? 'Tag o takiej nazwie już istnieje.'
      : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameError) return setShowErrors(true);
    if (tag) updateTag({ ...tag, name: trimmed });
    else createTag({ name: trimmed });
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:tag-dialog"
      title={tag ? 'Edytuj tag' : 'Nowy tag'}
      description="Tagi porządkują tematy niezależnie od katalogów."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Nazwa" required>
          <ClearableInput
            type="text"
            data-e2e="knowledge:tag-name"
            value={name}
            maxLength={TAG_MAX_LENGTH}
            autoComplete="off"
            placeholder="np. sql"
            aria-invalid={showErrors && nameError ? true : undefined}
            aria-describedby={
              showErrors && nameError ? 'tag-name-error' : undefined
            }
            onChange={(e) => setName(e.target.value)}
          />
          <FieldError
            id="tag-name-error"
            message={showErrors ? nameError : null}
          />
        </Field>
        <FormFooter modal={modal} entity="tag" editId={tag?.id} />
      </form>
    </ModalShell>
  );
};
