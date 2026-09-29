import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { categoryLabel } from '@/shared/i18n/category-label';
import {
  Button,
  CATEGORY_ICON_OPTIONS,
  CategoryIcon,
  Field,
  inputClass,
} from '@/shared/ui';
import { COLORS, NEW_CATEGORY_NAME } from '../configuration/constraints';
import { newCategoryId } from '../domain/ids';
import type { Category, CategoryIconId, Editing } from '../domain/models';
import { Card } from './layout';

type Props = {
  editing: Exclude<Editing, null>;
  onSave: (category: Category) => void;
  onDone: () => void;
};

export const CategoryForm = ({ editing, onSave, onDone }: Props) => {
  const base = editing.mode === 'edit' ? editing.category : null;
  const [name, setName] = useState(base ? categoryLabel(base.name) : '');
  const [icon, setIcon] = useState<CategoryIconId>(base?.icon ?? 'cart');
  const [color, setColor] = useState<string>(base?.color ?? COLORS[0]);

  const save = () => {
    if (editing.mode === 'new') {
      onSave({
        id: newCategoryId(),
        name: name || NEW_CATEGORY_NAME,
        icon,
        color,
      });
    } else {
      onSave({
        ...editing.category,
        name:
          !name || name === categoryLabel(editing.category.name)
            ? editing.category.name
            : name,
        icon,
        color,
      });
    }
    onDone();
  };

  return (
    <Card className="mt-2 space-y-4" data-e2e="categories:form">
      <h2 className="text-sm font-semibold">
        {editing.mode === 'new' ? 'Nowa kategoria' : 'Edycja kategorii'}
      </h2>
      <Field label="Nazwa">
        <input
          className={inputClass}
          value={name}
          data-e2e="categories:form-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Kultura"
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">
          Ikona
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ICON_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-label={`Ikona ${opt}`}
              aria-pressed={opt === icon}
              data-e2e="categories:form-icon"
              onClick={() => setIcon(opt)}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-full border',
                opt === icon
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-line-strong text-ink-soft',
              )}
            >
              <CategoryIcon id={opt} className="h-4 w-4" />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">
          Kolor
        </legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Kolor ${c}`}
              aria-pressed={c === color}
              data-e2e="categories:form-color"
              onClick={() => setColor(c)}
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ backgroundColor: c }}
            >
              {c === color ? (
                <Check className="h-4 w-4 text-on-brand" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button data-e2e="categories:form-save" onClick={save}>
          Zapisz
        </Button>
      </div>
    </Card>
  );
};
