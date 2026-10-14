import { categoryLabel } from '@/shared/i18n/category-label';
import { Layers, Pencil } from 'lucide-react';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { money } from '../domain/format';
import type { Period } from '@/shared/period/period';
import type { Category, CategoryProgress, LimitId } from '../domain/models';
import { LIMIT_NOUN } from '../domain/period';
import { categoryOf, limitTone } from './selectors';

export const CategoryLimits = ({
  progress,
  period,
  categories,
  onEdit,
}: {
  progress: CategoryProgress[];
  period: Period;
  categories: Category[];
  onEdit: (id: LimitId) => void;
}) =>
  progress.length === 0 ? (
    <div className="grid h-full min-h-32 place-items-center rounded-xl border border-dashed border-line p-4 text-center">
      <div className="space-y-1">
        <Layers className="mx-auto h-6 w-6 text-ink-soft" aria-hidden="true" />
        <p className="text-sm font-medium">Brak limitów kategorii.</p>
        <p className="text-xs text-ink-soft">
          Ogranicz wydatki w wybranej kategorii przyciskiem Dodaj limit.
        </p>
      </div>
    </div>
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
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink-soft">
                {Math.round(c.pct)}% limitu na {LIMIT_NOUN[period.kind]}
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
