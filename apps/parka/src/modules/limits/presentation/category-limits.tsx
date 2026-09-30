import { useState } from 'react';
import { Plus } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, CategoryAvatar, Card, ProgressBar } from '@/shared/ui';
import { money } from '../domain/format';
import type { Category, CategoryProgress } from '../domain/models';
import { resolveCategory, tone } from './selectors';
import { NewLimitForm } from './new-limit-form';

export const CategoryLimits = ({
  progress,
  categories,
}: {
  progress: CategoryProgress[];
  categories: Category[];
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <ul
        className="grid gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-3"
        data-e2e="limits:category-list"
      >
        {progress.map((c) => {
          const category = resolveCategory(categories, c.categoryId);
          return (
            <Card as="li" key={c.categoryId} className="space-y-2">
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
                tone={tone(c.pct)}
                label={`${categoryLabel(category.name)}: ${Math.round(c.pct)}% limitu`}
              />
              <p className="text-xs text-ink-soft">
                {Math.round(c.pct)}% limitu
                {c.alertAt80 ? ' · alert przy 80%' : ''}
              </p>
            </Card>
          );
        })}
      </ul>

      {showForm ? (
        <NewLimitForm onDone={() => setShowForm(false)} />
      ) : (
        <Button
          className="md:max-w-xs"
          data-e2e="limits:new"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Ustaw nowy limit
        </Button>
      )}
    </>
  );
};
