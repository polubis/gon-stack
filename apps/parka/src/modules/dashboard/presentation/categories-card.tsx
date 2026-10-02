import { categoryLabel } from '@/shared/i18n/category-label';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
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
  summary: Summary | null;
}) => (
  <Card className="space-y-4 xl:col-span-4">
    <h2 className="text-base font-semibold">Kategorie wydatków</h2>
    {!summary ? (
      <Skeleton className="h-40 w-full" />
    ) : summary.categories.length > 0 ? (
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
