import { ChevronRight, Plus } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { CategoryIcon } from '@/shared/ui/icon';
import { ScreenHeader } from '@/shared/ui/layout';
import { DEFAULT_CATEGORIES } from '../configuration/constraints';
import type { Category, CategoryId } from '../domain/models';
import { useContext } from './context';
import { Card } from './layout';
import { ListSkeleton } from './list-skeleton';

type Default = (typeof DEFAULT_CATEGORIES)[number];

const toCategory = (d: Default): Category => ({
  id: d.slug as CategoryId,
  name: `category.${d.slug}`,
  icon: d.icon,
  color: d.color,
});

/** Browse: tap a row to edit it, use the header button to add. */
export const Main = () => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const initializing = ctx.useInitializing();

  const missingDefaults = DEFAULT_CATEGORIES.filter(
    (d) => !categories.some((c) => c.id === d.slug),
  );

  return (
    <>
      <div className="mx-auto w-full max-w-2xl md:px-4">
        <ScreenHeader
          title="Kategorie"
          backHref={APP_ROUTER.settings()}
          action={
            <Button
              href={APP_ROUTER.categoryNew()}
              data-e2e="categories:add"
              className="w-auto px-3 py-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
            </Button>
          }
        />
      </div>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:px-8">
        {initializing ? (
          <ListSkeleton />
        ) : categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-soft">
            Nie masz jeszcze kategorii. Dodaj własną albo wybierz jedną z
            sugestii poniżej.
          </p>
        ) : (
          <ul
            className="overflow-hidden rounded-2xl border border-line bg-card"
            data-e2e="categories:list"
          >
            {categories.map((c) => (
              <li key={c.id} className="border-b border-line last:border-0">
                <a
                  href={APP_ROUTER.categoryEdit({ id: c.id })}
                  data-e2e={`categories:row:${c.id}`}
                  aria-label={`Edytuj kategorię ${categoryLabel(c.name)}`}
                  className="flex w-full items-center gap-3 px-3 py-3 hover:bg-hover-soft"
                >
                  <CategoryAvatar category={c} />
                  <span className="flex-1 text-sm font-medium">
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
        )}

        {!initializing && missingDefaults.length > 0 ? (
          <Card className="space-y-3">
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
      </main>
    </>
  );
};
