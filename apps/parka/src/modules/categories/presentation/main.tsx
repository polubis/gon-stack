import { categoryLabel } from '@/shared/i18n/category-label';
import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  AppShell,
  Card,
  ScreenHeader,
  Button,
  Field,
  inputClass,
  CategoryAvatar,
  CategoryIcon,
  CATEGORY_ICON_OPTIONS,
} from '@/modules/shared/ui';
import {
  useParkaState,
  createCategory,
  updateCategory,
  genId,
  type Category,
  type CategoryIconId,
} from '@/modules/shared/data';
import { APP_ROUTER } from '@/shared/router';
import { DEFAULT_CATEGORIES } from '../configuration/defaults';

const COLORS = [
  '#0f7a4f',
  '#2563eb',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#0891b2',
  '#a16207',
  '#4b5a52',
];

const addDefault = (d: (typeof DEFAULT_CATEGORIES)[number]) =>
  createCategory({
    id: d.slug,
    name: `category.${d.slug}`,
    icon: d.icon,
    color: d.color,
  });

type Editing = { mode: 'new' } | { mode: 'edit'; category: Category } | null;

export const Main = () => {
  const state = useParkaState();
  const [editing, setEditing] = useState<Editing>(null);
  const missingDefaults = DEFAULT_CATEGORIES.filter(
    (d) => !state.categories.some((c) => c.id === d.slug),
  );

  return (
    <AppShell e2e="categories:main" nav="more">
      <ScreenHeader
        title="Kategorie"
        backHref={APP_ROUTER.settings()}
        action={
          <button
            type="button"
            aria-label="Dodaj kategorię"
            data-e2e="categories:new"
            onClick={() => setEditing({ mode: 'new' })}
            className="grid h-9 w-9 place-items-center rounded-full bg-brand text-on-brand"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        }
      />
      <main className="flex flex-1 flex-col gap-2 px-4 pb-6 pt-2">
        <ul
          className="overflow-hidden rounded-2xl border border-line bg-card"
          data-e2e="categories:list"
        >
          {state.categories.map((c) => (
            <li key={c.id} className="border-b border-line last:border-0">
              <button
                type="button"
                data-e2e={`categories:row:${c.id}`}
                onClick={() => setEditing({ mode: 'edit', category: c })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02]"
              >
                <CategoryAvatar category={c} />
                <span className="flex-1 text-sm font-medium">
                  {categoryLabel(c.name)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {missingDefaults.length > 0 ? (
          <Card className="space-y-3">
            <h2 className="text-sm font-semibold">Sugerowane kategorie</h2>
            <ul className="flex flex-wrap gap-2">
              {missingDefaults.map((d) => (
                <li key={d.slug}>
                  <button
                    type="button"
                    data-e2e={`categories:add-default:${d.slug}`}
                    onClick={() => addDefault(d)}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm"
                  >
                    <CategoryIcon id={d.icon} className="h-4 w-4" />
                    {categoryLabel(`category.${d.slug}`)}
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              data-e2e="categories:add-defaults"
              onClick={() => missingDefaults.forEach(addDefault)}
            >
              Dodaj wszystkie
            </Button>
          </Card>
        ) : null}

        {editing ? (
          <CategoryForm
            key={editing.mode === 'edit' ? editing.category.id : 'new'}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </main>
    </AppShell>
  );
};

const CategoryForm = ({
  editing,
  onDone,
}: {
  editing: Exclude<Editing, null>;
  onDone: () => void;
}) => {
  const base = editing.mode === 'edit' ? editing.category : null;
  const [name, setName] = useState(base ? categoryLabel(base.name) : '');
  const [icon, setIcon] = useState<CategoryIconId>(base?.icon ?? 'cart');
  const [color, setColor] = useState(base?.color ?? COLORS[0]);

  const save = () => {
    if (editing.mode === 'new') {
      createCategory({
        id: genId('cat'),
        name: name || 'Nowa kategoria',
        icon,
        color,
      });
    } else {
      updateCategory({
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
