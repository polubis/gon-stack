import { ChartPie, Plus, Tags } from 'lucide-react';
import {
  CATEGORIES_LIST_MODAL,
  NEW_CATEGORY_MODAL,
} from '@/modules/categories/presentation/modal-ids';
import { categoryLabel } from '@/shared/i18n/category-label';
import { openModal, useModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card } from '@/shared/ui/layout';
import { MAX_VISIBLE_CATEGORIES } from '../configuration/constraints';
import type { Period } from '@/shared/period/period';
import type { Summary } from '../domain/models';
import { periodTitle } from '../domain/period';
import { Donut } from './charts';
import { DetailDialog } from './detail-dialog';
import { CATEGORIES_MODAL } from './modal-ids';

const NewCategory = ({ label = 'Dodaj' }: { label?: string }) => (
  <Button
    variant="ghost"
    onClick={() => openModal(NEW_CATEGORY_MODAL)}
    className="w-auto min-w-0 px-3 py-1.5"
    data-e2e="dashboard:category-new"
  >
    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span className="truncate">{label}</span>
  </Button>
);

export const CategoriesCard = ({
  period,
  summary,
}: {
  period: Period;
  summary: Summary;
}) => {
  const all = useModal(CATEGORIES_MODAL);
  const slices = summary.categories.map((c) => ({
    label: categoryLabel(c.name),
    value: c.amount,
    color: c.color,
  }));
  const caption = `Rozkład wydatków wg kategorii w okresie: ${periodTitle(period)}`;

  return (
    <Card className="space-y-4 xl:col-span-6 xl:col-start-7 xl:row-start-2">
      <div className="flex min-h-9 items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Kategorie</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => openModal(CATEGORIES_LIST_MODAL)}
            className="w-auto min-w-0 px-3 py-1.5"
            data-e2e="dashboard:categories-manage"
          >
            <Tags className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Zarządzaj</span>
          </Button>
        </div>
      </div>
      {slices.length === 0 ? (
        <EmptyState
          variant="card"
          data-e2e="dashboard:categories-empty"
          className="min-h-40"
          icon={ChartPie}
          title="Brak podziału na kategorie"
          description={`Podział pojawi się po dodaniu wydatków: ${periodTitle(period)}.`}
          action={<NewCategory label="Dodaj kategorię" />}
        />
      ) : (
        <Donut
          caption={caption}
          slices={slices}
          rows={MAX_VISIBLE_CATEGORIES}
          onShowAll={all.open}
        />
      )}
      {all.isOpen && (
        <DetailDialog
          modal={CATEGORIES_MODAL}
          data-e2e="dashboard:categories-dialog"
          title="Kategorie"
          description={periodTitle(period)}
          onClose={all.close}
        >
          <Donut caption={caption} slices={slices} />
        </DetailDialog>
      )}
    </Card>
  );
};
