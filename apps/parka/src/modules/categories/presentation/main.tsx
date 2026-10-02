import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { CategoryIcon } from '@/shared/ui/icon';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { ScreenHeader } from '@/shared/ui/layout';
import { Toast } from '@/shared/ui/toast';
import { DEFAULT_CATEGORIES, ERROR_CODES } from '../configuration/constraints';
import type { Category, CategoryId, Editing } from '../domain/models';
import { CategoryForm } from './category-form';
import { Provider, useContext } from './context';
import { Card } from './layout';
import { ListSkeleton } from './list-skeleton';

const NEW: Editing = { mode: 'new' };

type Default = (typeof DEFAULT_CATEGORIES)[number];

const toCategory = (d: Default): Category => ({
  id: d.slug as CategoryId,
  name: `category.${d.slug}`,
  icon: d.icon,
  color: d.color,
});

const CategoriesView = () => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [editing, setEditing] = useState<Editing>(NEW);
  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    setEditing(NEW);
    setFormKey((n) => n + 1);
  };

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const missingDefaults = DEFAULT_CATEGORIES.filter(
    (d) => !categories.some((c) => c.id === d.slug),
  );

  return (
    <div data-e2e="categories:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Kategorie" backHref={APP_ROUTER.settings()} />
      </div>
      <main className="flex flex-1 flex-col gap-2 px-4 pb-6 pt-2 md:gap-4 md:px-8 lg:grid lg:grid-cols-3 lg:content-start lg:items-start lg:px-10 xl:px-16">
        {error ? (
          <div className="lg:col-span-3">
            <ErrorState
              data-e2e="categories:load-error"
              title="Nie udało się wczytać kategorii"
              code={ERROR_CODES.load}
              description={error}
              onRetry={ctx.load}
              backHref={APP_ROUTER.settings()}
            />
          </div>
        ) : null}

        <div className="lg:col-span-2 lg:row-span-2">
          {initializing ? (
            <ListSkeleton />
          ) : (
            <ul
              className="overflow-hidden rounded-2xl border border-line bg-card"
              data-e2e="categories:list"
            >
              {categories.map((c) => (
                <li key={c.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    data-e2e={`categories:row:${c.id}`}
                    onClick={() => setEditing({ mode: 'edit', category: c })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-hover-soft"
                  >
                    <CategoryAvatar category={c} />
                    <span className="flex-1 text-sm font-medium">
                      {categoryLabel(c.name)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!initializing && !error && missingDefaults.length > 0 ? (
          <Card className="space-y-3 lg:col-start-3">
            <h2 className="text-sm font-semibold">Sugerowane kategorie</h2>
            <ul className="flex flex-wrap gap-2">
              {missingDefaults.map((d) => (
                <li key={d.slug}>
                  <button
                    type="button"
                    data-e2e={`categories:add-default:${d.slug}`}
                    onClick={() => ctx.create(toCategory(d))}
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
              onClick={() =>
                missingDefaults.forEach((d) => ctx.create(toCategory(d)))
              }
            >
              Dodaj wszystkie
            </Button>
          </Card>
        ) : null}

        <CategoryForm
          key={editing.mode === 'edit' ? editing.category.id : `new-${formKey}`}
          editing={editing}
          onSave={editing.mode === 'new' ? ctx.create : ctx.update}
          onDone={resetForm}
        />
      </main>

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="categories:toast"
          tone={notice.tone}
          message={notice.message}
          onDismiss={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku kategorii"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić kategorii. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <Provider>
      <CategoriesView />
    </Provider>
  </ErrorBoundary>
);
