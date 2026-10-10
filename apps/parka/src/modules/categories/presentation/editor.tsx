import { useState, type FormEvent } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { categoryLabel } from '@/shared/i18n/category-label';
import { useModal } from '@/shared/router/modal-stack';
import { navigateTo, readQueryParam } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { CategoryIcon } from '@/shared/ui/icon';
import { ScreenHeader } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import {
  COLORS,
  ERROR_CODES,
  NAME_MAX_LENGTH,
} from '../configuration/constraints';
import { newCategoryId } from '../domain/ids';
import type { Category } from '../domain/models';
import { ColorPicker } from './color-picker';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import { IconPicker } from './icon-picker';

const isPreset = (value: string) =>
  COLORS.some((preset) => preset === value.toLowerCase());

/** URL id of the delete confirmation (see `shared/router/modal-stack`). */
const DELETE_MODAL = 'delete';

const backToList = () => navigateTo(APP_ROUTER.categories());

type FormProps = {
  /** `null` = creating a new category. */
  base: Category | null;
};

const Form = ({ base }: FormProps) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const originalName = base ? categoryLabel(base.name) : '';
  const deleting = useModal(DELETE_MODAL);
  const [name, setName] = useState(originalName);
  const [icon, setIcon] = useState<CategoryIconId>(base?.icon ?? 'cart');
  const [color, setColor] = useState<string>(base?.color ?? COLORS[0]);
  const [showErrors, setShowErrors] = useState(false);
  const [custom, setCustom] = useState<string | null>(
    base && !isPreset(base.color) ? base.color : null,
  );

  const trimmed = name.trim();
  const duplicate = categories.some(
    (c) => c.id !== base?.id && categoryLabel(c.name) === trimmed,
  );
  const nameError = !trimmed
    ? 'Podaj nazwę kategorii.'
    : duplicate
      ? 'Kategoria o takiej nazwie już istnieje.'
      : null;

  const pickColor = (value: string) => {
    setColor(value);
    if (!isPreset(value)) setCustom(value);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameError) {
      setShowErrors(true);
      return;
    }
    if (base) {
      ctx.update({
        ...base,
        name: trimmed === originalName ? base.name : trimmed,
        icon,
        color,
      });
    } else {
      ctx.create({ id: newCategoryId(), name: trimmed, icon, color });
    }
    backToList();
  };

  return (
    <>
      <div className="mx-auto w-full max-w-2xl md:px-4">
        <ScreenHeader
          title={base ? `Edytuj: ${originalName}` : 'Nowa kategoria'}
          backHref={APP_ROUTER.categories()}
        />
      </div>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8 pt-2 md:px-8">
        <form
          onSubmit={submit}
          noValidate
          data-e2e="categories:form"
          className="space-y-6"
        >
          <Field label="Nazwa">
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full"
                style={{ backgroundColor: `${color}1a`, color }}
              >
                <CategoryIcon id={icon} className="h-4 w-4" />
              </span>
              <input
                autoFocus={!base}
                className={cn(inputClass, 'pl-12')}
                value={name}
                maxLength={NAME_MAX_LENGTH}
                data-e2e="categories:form-name"
                aria-invalid={showErrors && nameError ? true : undefined}
                aria-describedby={
                  showErrors && nameError ? 'category-name-error' : undefined
                }
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Kultura"
              />
            </div>
          </Field>
          {showErrors && nameError ? (
            <p
              id="category-name-error"
              role="alert"
              data-e2e="categories:form-name-error"
              className="-mt-4 text-sm text-danger"
            >
              {nameError}
            </p>
          ) : null}

          <ColorPicker value={color} custom={custom} onChange={pickColor} />
          <IconPicker value={icon} color={color} onChange={setIcon} />

          <div className="flex gap-2">
            <Button variant="ghost" href={APP_ROUTER.categories()}>
              Anuluj
            </Button>
            <Button type="submit" data-e2e="categories:form-save">
              {base ? 'Zapisz zmiany' : 'Dodaj kategorię'}
            </Button>
          </div>

          {base ? (
            <div className="border-t border-line pt-6">
              <Button
                variant="danger"
                data-e2e="categories:form-delete"
                onClick={deleting.open}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń kategorię
              </Button>
            </div>
          ) : null}
        </form>
      </main>

      {base && deleting.isOpen ? (
        <DeleteDialog
          modal={DELETE_MODAL}
          name={originalName}
          onClose={deleting.close}
          onConfirm={() => {
            ctx.remove(base.id);
            backToList();
          }}
        />
      ) : null}
    </>
  );
};

const EditorSkeleton = () => (
  <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 md:px-8">
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-16 w-full rounded-xl" />
    <div className="flex gap-2">
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  </div>
);

/** `/new/` creates; `/edit/?id=<categoryId>` edits and deletes that category. */
export const Main = () => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const initializing = ctx.useInitializing();
  const editing = useRouterState({
    select: (s) => s.location.pathname.includes('/edit/'),
  });

  if (!editing) return <Form key="new" base={null} />;
  if (initializing) return <EditorSkeleton />;

  const id = readQueryParam('id');
  const category = categories.find((c) => c.id === id);
  if (!category) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 md:px-8">
        <ErrorState
          data-e2e="categories:not-found"
          title="Nie znaleziono kategorii"
          code={ERROR_CODES.notFound}
          description="Ta kategoria nie istnieje lub została już usunięta."
          onRetry={ctx.load}
          backHref={APP_ROUTER.categories()}
          backLabel="Wróć do listy"
        />
      </div>
    );
  }
  return <Form key={category.id} base={category} />;
};
