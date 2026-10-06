import { Plus } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import {
  MAX_CATEGORY_SLICES,
  OTHER_CATEGORY_LABEL,
  OTHER_CATEGORY_NAME,
} from '../configuration/constraints';
import { monthTitle } from '../domain/format';
import type { Month, Summary } from '../domain/models';
import { Donut } from './charts';
import { foldSlices } from './selectors';

export const CategoriesCard = ({
  month,
  summary,
}: {
  month: Month;
  summary: Summary;
}) => (
  <Card className="space-y-4 xl:col-span-6 xl:col-start-7 xl:row-start-2">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-base font-semibold">Kategorie wydatków</h2>
      <Button
        variant="ghost"
        href={APP_ROUTER.categories()}
        className="w-auto min-w-0 px-3 py-1.5"
        data-e2e="dashboard:category-new"
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Dodaj kategorię</span>
      </Button>
    </div>
    {summary.categories.length > 0 ? (
      <Donut
        caption={`Rozkład wydatków wg kategorii w ${monthTitle(month)}`}
        slices={foldSlices(
          summary.categories.map((c) => ({
            label: categoryLabel(c.name),
            value: c.amount,
            color: c.color,
            isOther: c.name === OTHER_CATEGORY_NAME,
          })),
          MAX_CATEGORY_SLICES,
          (value) => ({
            label: OTHER_CATEGORY_LABEL,
            value,
            color: 'var(--track-strong)',
            isOther: true,
          }),
        )}
      />
    ) : (
      <p className="text-sm text-ink-soft">Brak wydatków w tym miesiącu.</p>
    )}
  </Card>
);
