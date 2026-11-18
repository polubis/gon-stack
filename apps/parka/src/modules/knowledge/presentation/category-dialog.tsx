import { useState, type FormEvent } from 'react';
import { closeModal } from '@/shared/router/modal-stack';
import { ClearableInput } from '@/shared/ui/clearable';
import { Field } from '@/shared/ui/controls';
import { CATEGORY_COLORS, NAME_MAX_LENGTH } from '../configuration/constraints';
import type { Category } from '../domain/models';
import { ColorPicker } from './color-picker';
import { useContext } from './context';
import { FieldError } from './field-error';
import { FormFooter } from './form-footer';
import { ModalShell } from './modal-shell';

/** Category (area) form: a name and a colour. Edits when `category` is given. */
export const CategoryDialog = ({
  modal,
  category,
}: {
  modal: string;
  category?: Category;
}) => {
  const { categories, createCategory, updateCategory } = useContext();
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState<string>(
    category?.color ?? CATEGORY_COLORS[0],
  );
  const [showErrors, setShowErrors] = useState(false);
  const trimmed = name.trim();
  const nameError = !trimmed
    ? 'Podaj nazwę kategorii.'
    : categories.some(
          (c) =>
            c.id !== category?.id &&
            c.name.toLowerCase() === trimmed.toLowerCase(),
        )
      ? 'Kategoria o takiej nazwie już istnieje.'
      : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameError) return setShowErrors(true);
    if (category) updateCategory({ ...category, name: trimmed, color });
    else createCategory({ name: trimmed, color });
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:category-dialog"
      title={category ? 'Edytuj kategorię' : 'Nowa kategoria'}
      description="Nazwa i kolor kategorii wiedzy."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Nazwa" required>
          <ClearableInput
            type="text"
            data-e2e="knowledge:category-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="off"
            placeholder="np. Języki"
            aria-invalid={showErrors && nameError ? true : undefined}
            aria-describedby={
              showErrors && nameError ? 'category-name-error' : undefined
            }
            onChange={(e) => setName(e.target.value)}
          />
          <FieldError
            id="category-name-error"
            message={showErrors ? nameError : null}
          />
        </Field>
        <ColorPicker
          value={color}
          custom={CATEGORY_COLORS.some((c) => c === color) ? null : color}
          onChange={setColor}
        />
        <FormFooter modal={modal} entity="category" editId={category?.id} />
      </form>
    </ModalShell>
  );
};
