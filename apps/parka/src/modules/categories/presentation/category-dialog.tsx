import { useState, type FormEvent } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { closeModal } from '@/shared/router/modal-stack';
import { Button, Field } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { CategoryIcon } from '@/shared/ui/icon';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import { COLORS, NAME_MAX_LENGTH } from '../configuration/constraints';
import { newCategoryId } from '../domain/ids';
import { ColorPicker } from './color-picker';
import { useContext } from './context';
import { IconPicker } from './icon-picker';
import { ModalShell } from './modal-shell';

/** New category form in a stacked modal: name with icon preview, colour, icon. */
export const CategoryDialog = ({ modal }: { modal: string }) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<CategoryIconId>('cart');
  const [color, setColor] = useState<string>(COLORS[0]);
  const [showErrors, setShowErrors] = useState(false);

  const trimmed = name.trim();
  const duplicate = categories.some((c) => categoryLabel(c.name) === trimmed);
  const nameError = !trimmed
    ? 'Podaj nazwę kategorii.'
    : duplicate
      ? 'Kategoria o takiej nazwie już istnieje.'
      : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameError) {
      setShowErrors(true);
      return;
    }
    ctx.create({ id: newCategoryId(), name: trimmed, icon, color });
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="categories:new-dialog"
      title="Nowa kategoria"
      description="Nazwa, kolor i ikona kategorii."
    >
      <form
        onSubmit={submit}
        noValidate
        data-e2e="categories:form"
        className="space-y-5"
      >
        <Field label="Nazwa">
          <ClearableInput
            leading={
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full"
                style={{ backgroundColor: `${color}1a`, color }}
              >
                <CategoryIcon id={icon} className="h-4 w-4" />
              </span>
            }
            className="pl-12"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            data-e2e="categories:form-name"
            aria-invalid={showErrors && nameError ? true : undefined}
            aria-describedby={
              showErrors && nameError ? 'category-modal-name-error' : undefined
            }
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Kultura"
          />
        </Field>
        {showErrors && nameError ? (
          <p
            id="category-modal-name-error"
            role="alert"
            data-e2e="categories:form-name-error"
            className="-mt-3 text-sm text-danger"
          >
            {nameError}
          </p>
        ) : null}

        <ColorPicker value={color} custom={null} onChange={setColor} />
        <IconPicker value={icon} color={color} onChange={setIcon} />

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => closeModal(modal)}>
            Anuluj
          </Button>
          <Button type="submit" data-e2e="categories:form-save">
            Dodaj kategorię
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};
