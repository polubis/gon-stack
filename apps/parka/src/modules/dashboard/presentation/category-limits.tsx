import { categoryLabel } from '@/shared/i18n/category-label';
import { Pencil } from 'lucide-react';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { money } from '../domain/format';
import type { Category, CategoryProgress, LimitId } from '../domain/models';
import { categoryOf, limitTone } from './selectors';

export const CategoryLimits = ({
  progress,
  categories,
  onEdit,
}: {
  progress: CategoryProgress[];
  categories: Category[];
  onEdit: (id: LimitId) => void;
}) =>
  progress.length === 0 ? (
    <p className="text-sm text-ink-soft">Brak limitów kategorii.</p>
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
            <div className="flex items-center gap-3">
              <CategoryAvatar category={category} />
              <span className="flex-1 text-sm font-medium">
                {categoryLabel(category.name)}
              </span>
              <span className="text-sm tabular-nums">
                {money(c.spent)} / {money(c.amount)}
              </span>
            </div>
            <ProgressBar
              pct={c.pct}
              tone={limitTone(c.pct)}
              label={`${categoryLabel(category.name)}: ${Math.round(c.pct)}% limitu`}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink-soft">
                {Math.round(c.pct)}% limitu
                {c.alertAt80 ? ' · alert przy 80%' : ''}
              </p>
              <Button
                variant="ghost"
                className="w-auto px-2 py-1"
                aria-label={`Edytuj limit: ${categoryLabel(category.name)}`}
                data-e2e={`dashboard:limit-edit:${c.id}`}
                onClick={() => onEdit(c.id)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
