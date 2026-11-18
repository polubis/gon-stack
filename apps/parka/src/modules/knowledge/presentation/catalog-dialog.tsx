import { useState, type FormEvent } from 'react';
import { closeModal } from '@/shared/router/modal-stack';
import { ClearableInput, ClearableTextarea } from '@/shared/ui/clearable';
import { Field, Select } from '@/shared/ui/controls';
import {
  CATALOG_NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from '../configuration/constraints';
import type { Catalog, CategoryId } from '../domain/models';
import { useContext } from './context';
import { FieldError } from './field-error';
import { FormFooter } from './form-footer';
import { ModalShell } from './modal-shell';

const NO_CATEGORY = 'none';

/** Catalog form: name, description, category. Edits when `catalog` is given. */
export const CatalogDialog = ({
  modal,
  catalog,
}: {
  modal: string;
  catalog?: Catalog;
}) => {
  const { categories, createCatalog, updateCatalog } = useContext();
  const [name, setName] = useState(catalog?.name ?? '');
  const [description, setDescription] = useState(catalog?.description ?? '');
  const [categoryId, setCategoryId] = useState<string>(
    catalog?.categoryId ?? NO_CATEGORY,
  );
  const [showErrors, setShowErrors] = useState(false);
  const trimmed = name.trim();
  const nameError = trimmed ? null : 'Podaj nazwę katalogu.';
  // A category deleted meanwhile reads as none.
  const category = categories.some((c) => c.id === categoryId)
    ? (categoryId as CategoryId)
    : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameError) return setShowErrors(true);
    const input = {
      name: trimmed,
      description: description.trim(),
      categoryId: category,
    };
    if (catalog) updateCatalog({ ...catalog, ...input });
    else createCatalog(input);
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:catalog-dialog"
      title={catalog ? 'Edytuj katalog' : 'Nowy katalog'}
      description="Katalog zbiera tematy jednej dziedziny."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Nazwa" required>
          <ClearableInput
            type="text"
            data-e2e="knowledge:catalog-name"
            value={name}
            maxLength={CATALOG_NAME_MAX_LENGTH}
            autoComplete="off"
            placeholder="np. Angielski"
            aria-invalid={showErrors && nameError ? true : undefined}
            aria-describedby={
              showErrors && nameError ? 'catalog-name-error' : undefined
            }
            onChange={(e) => setName(e.target.value)}
          />
          <FieldError
            id="catalog-name-error"
            message={showErrors ? nameError : null}
          />
        </Field>
        <Field label="Opis">
          <ClearableTextarea
            data-e2e="knowledge:catalog-description"
            rows={3}
            value={description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Kategoria">
          <Select
            data-e2e="knowledge:catalog-category"
            value={category ?? NO_CATEGORY}
            options={[
              { value: NO_CATEGORY, label: 'Bez kategorii' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            onValueChange={setCategoryId}
          />
        </Field>
        <FormFooter modal={modal} entity="catalog" editId={catalog?.id} />
      </form>
    </ModalShell>
  );
};
