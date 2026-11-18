import { useState } from 'react';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import {
  closeModalThen,
  openModal,
  useModal,
} from '@/shared/router/modal-stack';
import { ScopeNote } from '@/shared/ui/scope-note';
import { RecurringScopeDialog } from '@/shared/ui/recurring-scope-dialog';
import { money, plainDateLabel } from '../domain/format';
import type { Period } from '@/shared/period/period';
import type { Recurring, Upcoming } from '../domain/models';
import { useContext } from './context';
import { DetailDialog } from './detail-dialog';
import { deleteModal } from './modal-ids';
import { RecurringBadge, UpcomingBadge } from './recurring-badge';
import { RecurringForm } from './recurring-form';
import { categoryOf, intervalLabel } from './selectors';

/**
 * Popup of an upcoming (not yet charged) payment. It stands for its rule;
 * after confirming, the user picks how far the change reaches (the whole
 * series, only this payment, this and the following, or only the following).
 */
export const RecurringDetail = ({
  modal,
  upcoming,
  period,
  onClose,
}: {
  modal: string;
  upcoming: Upcoming;
  period: Period;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const { recurring } = upcoming;
  const charged = ctx
    .useExpenses()
    .filter((e) => e.recurringId === recurring.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const confirmId = deleteModal(upcoming.id);
  const confirming = useModal(confirmId);
  // The edit waits here while the user picks how far it reaches.
  const [pending, setPending] = useState<Recurring | null>(null);

  return (
    <DetailDialog
      modal={modal}
      data-e2e="dashboard:recurring-dialog"
      title={recurring.name}
      description={`${intervalLabel(recurring.interval)} · płatność ${plainDateLabel(upcoming.date)}`}
      badge={
        <>
          <RecurringBadge />
          <UpcomingBadge />
        </>
      }
      avatar={
        <CategoryAvatar
          category={categoryOf(categories, recurring.categoryId)}
        />
      }
      onClose={onClose}
    >
      <ScopeNote className="mb-3" data-e2e="dashboard:scope-note">
        Po zapisaniu lub usunięciu wybierzesz, czy zmiana dotyczy wszystkich
        płatności serii, tylko tej, tej i następnych, czy tylko następnych.
      </ScopeNote>
      <RecurringForm
        recurring={recurring}
        onSave={setPending}
        onDone={onClose}
        onRemove={() => openModal(confirmId)}
      >
        {charged.length > 0 ? (
          <div
            className="border-t border-line pt-3"
            data-e2e="dashboard:recurring-detail"
          >
            <p className="mb-1 text-sm font-semibold">Historia płatności</p>
            <ul className="space-y-1 text-sm">
              {charged.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span className="text-ink-soft">
                    {plainDateLabel(e.occurrenceDate ?? e.date.slice(0, 10))}
                  </span>
                  <span className="tabular-nums">{money(e.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </RecurringForm>
      {pending ? (
        <RecurringScopeDialog
          action="edit"
          title={`Zapisać zmiany w „${recurring.name}”?`}
          subject="Wybierz, które płatności tej serii objąć zmianą. Samo naliczanie nie zmienia się."
          confirmLabel="Zapisz"
          onClose={() => setPending(null)}
          onConfirm={(scope) => {
            ctx.updateRecurring(pending, period, scope, upcoming.date);
            setPending(null);
            onClose();
          }}
        />
      ) : null}
      {confirming.isOpen ? (
        <RecurringScopeDialog
          modal={confirmId}
          action="delete"
          title={`Usunąć wydatek cykliczny „${recurring.name}”?`}
          subject="Wybierz, które płatności tej serii usunąć razem z ich wydatkami."
          confirmLabel="Usuń"
          onClose={confirming.close}
          onConfirm={(scope) =>
            closeModalThen(confirmId, () => {
              ctx.removeRecurring(recurring.id, period, scope, upcoming.date);
              onClose();
            })
          }
        />
      ) : null}
    </DetailDialog>
  );
};
