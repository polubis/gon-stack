import { ChevronRight, Plus, Tags } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { openModal } from '@/shared/router/modal-stack';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { changeProps, useListChanges } from '@/shared/ui/list-changes';
import { cn } from '@repo/react-kit/cn';
import { Skeleton } from '@/shared/ui/skeleton';
import { ERROR_CODES } from '../configuration/constraints';
import { useContext } from './context';
import { NEW_CATEGORY_MODAL } from './modal-ids';
import { ModalShell } from './modal-shell';
import { stagger } from './stagger';

/** Browse list of the categories; a row opens its editor, "Dodaj" stacks the form. */
export const CategoriesDialog = ({ modal }: { modal: string }) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const initializing = ctx.useInitializing();
  const error = ctx.useError();
  const rows = useListChanges(categories, (c) => c.id, String(initializing));
  const add = (
    <Button
      onClick={() => openModal(NEW_CATEGORY_MODAL)}
      data-e2e="categories:add"
      className="w-auto px-3 py-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
    </Button>
  );

  return (
    <ModalShell
      modal={modal}
      data-e2e="categories:list-dialog"
      title="Kategorie"
      description="Wszystkie kategorie wydatków."
    >
      {error ? (
        <ErrorState
          data-e2e="categories:load-error"
          title="Nie udało się wczytać kategorii"
          code={ERROR_CODES.load}
          description={error}
          onRetry={ctx.load}
          backHref={APP_ROUTER.dashboard()}
        />
      ) : initializing ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : categories.length === 0 && rows.length === 0 ? (
        <EmptyState
          data-e2e="categories:empty"
          icon={Tags}
          title="Nie masz jeszcze kategorii"
          description="Dodaj pierwszą kategorię wydatków."
          action={add}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end">{add}</div>
          <ul
            data-e2e="categories:list"
            className="max-h-80 overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-card"
          >
            {rows.map(({ key, item: c, phase, at }) => (
              <li
                key={key}
                style={phase === 'idle' ? stagger(at) : undefined}
                aria-hidden={changeProps(phase)['aria-hidden']}
                inert={changeProps(phase).inert}
                className={cn(
                  'border-b border-line last:border-0',
                  phase === 'idle' &&
                    'animate-item-in motion-reduce:animate-none',
                  changeProps(phase).className,
                )}
              >
                <a
                  href={APP_ROUTER.categoryEdit({ id: c.id })}
                  data-e2e={`categories:row:${c.id}`}
                  aria-label={`Edytuj kategorię ${categoryLabel(c.name)}`}
                  className="flex w-full items-center gap-3 px-3 py-3 transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                  <CategoryAvatar category={c} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {categoryLabel(c.name)}
                  </span>
                  <ChevronRight
                    className="h-5 w-5 text-ink-soft"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </ModalShell>
  );
};
