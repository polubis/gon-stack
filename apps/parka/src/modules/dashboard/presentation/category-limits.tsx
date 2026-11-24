import { categoryLabel } from '@/shared/i18n/category-label';
import { Layers, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { money } from '../domain/format';
import type { Period } from '@/shared/period/period';
import type { Category, CategoryProgress } from '../domain/models';
import { LIMIT_NOUN } from '../domain/period';
import { categoryOf, limitTone } from './selectors';

export const CategoryLimits = ({
  progress,
  period,
  categories,
  onAdd,
}: {
  progress: CategoryProgress[];
  period: Period;
  categories: Category[];
  onAdd: () => void;
}) =>
  progress.length === 0 ? (
    <EmptyState
      variant="card"
      className="h-full min-h-32"
      icon={Layers}
      title="Brak limitów kategorii."
      description="Ogranicz wydatki w wybranej kategorii."
      action={
        <Button
          variant="ghost"
          className="w-auto px-3 py-1.5"
          data-e2e="dashboard:limit-new"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj limit
        </Button>
      }
    />
  ) : (
    <ul
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-1"
      data-e2e="dashboard:limit-list"
    >
      {progress.map((c) => {
        const category = categoryOf(categories, c.categoryId);
        return (
          <li
            key={c.id}
            className="space-y-2 rounded-xl border border-line p-3"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <CategoryAvatar category={category} />
              <span className="min-w-24 flex-1 text-sm font-medium">
                {categoryLabel(category.name)}
              </span>
              <span className="ml-auto text-sm whitespace-nowrap tabular-nums">
                {money(c.spent)} / {money(c.amount)}
              </span>
            </div>
            <ProgressBar
              pct={c.pct}
              tone={limitTone(c.pct)}
              label={`${categoryLabel(category.name)}: ${Math.round(c.pct)}% limitu`}
            />
            <p className="text-xs text-ink-soft">
              {Math.round(c.pct)}% limitu na {LIMIT_NOUN[period.kind]}
              {` · powiadomienie od ${c.alertAt}%`}
            </p>
          </li>
        );
      })}
    </ul>
  );
