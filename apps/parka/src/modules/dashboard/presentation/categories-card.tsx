import { Plus } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { useModal } from '@/shared/router/modal-stack';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { MAX_VISIBLE_CATEGORIES } from '../configuration/constraints';
import { monthTitle } from '../domain/format';
import type { Month, Summary } from '../domain/models';
import { Donut } from './charts';
import { DetailDialog } from './detail-dialog';
import { CATEGORIES_MODAL } from './modal-ids';

export const CategoriesCard = ({
  month,
  summary,
}: {
  month: Month;
  summary: Summary;
}) => {
  const all = useModal(CATEGORIES_MODAL);
  const slices = summary.categories.map((c) => ({
    label: categoryLabel(c.name),
    value: c.amount,
    color: c.color,
  }));
  const caption = `Rozkład wydatków wg kategorii w ${monthTitle(month)}`;

  return (
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
          <span className="truncate">Dodaj</span>
        </Button>
      </div>
      {slices.length > 0 ? (
        <Donut
          caption={caption}
          slices={slices}
          rows={MAX_VISIBLE_CATEGORIES}
          onShowAll={all.open}
        />
      ) : (
        <p className="text-sm text-ink-soft">Brak wydatków w tym miesiącu.</p>
      )}
      {all.isOpen && (
        <DetailDialog
          modal={CATEGORIES_MODAL}
          data-e2e="dashboard:categories-dialog"
          title="Kategorie wydatków"
          description={monthTitle(month)}
          onClose={all.close}
        >
          <Donut caption={caption} slices={slices} />
        </DetailDialog>
      )}
    </Card>
  );
};
