import { CategoryAvatar } from '@/shared/ui/category-chip';
import { dateLabel, money } from '../domain/format';
import type { Month, Recurring } from '../domain/models';
import { useContext } from './context';
import { DetailDialog } from './detail-dialog';
import { RecurringBadge } from './recurring-badge';
import { RecurringForm } from './recurring-form';
import { categoryOf } from './selectors';

/** Popup of a recurring expense: form first, then its payment history. */
export const RecurringDetail = ({
  recurring,
  month,
  onClose,
}: {
  recurring: Recurring;
  month: Month;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();

  return (
    <DetailDialog
      data-e2e="dashboard:recurring-dialog"
      title={recurring.name}
      description={`Co miesiąc · następny ${dateLabel(recurring.nextPaymentDate)}`}
      badge={<RecurringBadge />}
      avatar={
        <CategoryAvatar
          category={categoryOf(categories, recurring.categoryId)}
        />
      }
      onClose={onClose}
    >
      <RecurringForm recurring={recurring} month={month} onDone={onClose}>
        {recurring.history.length > 0 ? (
          <div
            className="border-t border-line pt-3"
            data-e2e="dashboard:recurring-detail"
          >
            <p className="mb-1 text-sm font-semibold">Historia płatności</p>
            <ul className="space-y-1 text-sm">
              {recurring.history.map((h) => (
                <li key={h.date} className="flex justify-between">
                  <span className="text-ink-soft">{dateLabel(h.date)}</span>
                  <span className="tabular-nums">{money(h.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </RecurringForm>
    </DetailDialog>
  );
};
