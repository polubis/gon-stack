import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import { Button, Field } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { CategoryIcon } from '@/shared/ui/icon';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import type { Category } from '../domain/models';
import { CATEGORY_COLORS, NAME_MAX_LENGTH } from '../configuration/constraints';
import { ColorPicker } from './color-picker';
import { IconPicker } from './icon-picker';
import { useContext } from './context';
import { deleteCategoryModal } from './modal-ids';
import { ModalShell } from './modal-shell';

/**
 * Category form (new, or `category` being edited), a stacked-modal twin of the finance category editor:
 * name with the icon preview, colour picker, icon picker, same validation.
 */
export const CategoryDialog = ({
  modal,
  category,
}: {
  modal: string;
  category?: Category;
}) => {
  const { categories, createCategory, updateCategory } = useContext();
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState<CategoryIconId>(category?.icon ?? 'cart');
  const [color, setColor] = useState<string>(
    category?.color ?? CATEGORY_COLORS[0],
  );
  const [showErrors, setShowErrors] = useState(false);

  const trimmed = name.trim();
  const duplicate = categories.some(
    (c) => c.id !== category?.id && c.name === trimmed,
  );
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
    if (category) updateCategory({ ...category, name: trimmed, icon, color });
    else createCategory({ name: trimmed, icon, color });
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:category-dialog"
      title={category ? 'Edytuj kategorię' : 'Nowa kategoria'}
      description="Nazwa, kolor i ikona kategorii."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
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
            aria-invalid={showErrors && nameError ? true : undefined}
            aria-describedby={
              showErrors && nameError ? 'time-category-name-error' : undefined
            }
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Kultura"
          />
        </Field>
        {showErrors && nameError ? (
          <p
            id="time-category-name-error"
            role="alert"
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
          <Button type="submit" data-e2e="time:category-save">
            {category ? 'Zapisz zmiany' : 'Dodaj kategorię'}
          </Button>
        </div>

        {category ? (
          <div className="border-t border-line pt-5">
            <Button
              variant="danger"
              data-e2e="time:category-delete"
              onClick={() => openModal(deleteCategoryModal(category.id))}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń kategorię
            </Button>
          </div>
        ) : null}
      </form>
    </ModalShell>
  );
};
