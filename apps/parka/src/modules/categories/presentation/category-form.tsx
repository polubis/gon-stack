import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from '@/shared/ui/icon';
import { COLORS, NEW_CATEGORY_NAME } from '../configuration/constraints';
import { newCategoryId } from '../domain/ids';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import type { Category, Editing } from '../domain/models';
import { Card } from './layout';

type Props = {
  editing: Editing;
  onSave: (category: Category) => void;
  onDone: () => void;
};

const isPreset = (value: string) =>
  COLORS.some((preset) => preset === value.toLowerCase());

export const CategoryForm = ({ editing, onSave, onDone }: Props) => {
  const base = editing.mode === 'edit' ? editing.category : null;
  const [name, setName] = useState(base ? categoryLabel(base.name) : '');
  const [icon, setIcon] = useState<CategoryIconId>(base?.icon ?? 'cart');
  const [color, setColor] = useState<string>(base?.color ?? COLORS[0]);
  const [custom, setCustom] = useState<string | null>(
    base && !isPreset(base.color) ? base.color : null,
  );
  const swatches: readonly string[] = custom ? [...COLORS, custom] : COLORS;

  const pickCustom = (value: string) => {
    setColor(value);
    setCustom(isPreset(value) ? null : value);
  };

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
    <Card
      className="order-first space-y-4 lg:order-none lg:col-start-3"
      data-e2e="categories:form"
    >
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
          Kolor
        </legend>
        <div className="flex flex-wrap gap-2">
          <label
            className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-dashed border-line-strong text-ink-soft focus-within:ring-2 focus-within:ring-brand"
            data-e2e="categories:form-color-custom"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Własny kolor</span>
            <input
              type="color"
              value={color}
              onChange={(e) => pickCustom(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          {swatches.map((c) => (
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
                  ? 'border-current'
                  : 'border-line-strong text-ink-soft',
              )}
              style={
                opt === icon
                  ? {
                      color,
                      backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                    }
                  : undefined
              }
            >
              <CategoryIcon id={opt} className="h-4 w-4" />
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
