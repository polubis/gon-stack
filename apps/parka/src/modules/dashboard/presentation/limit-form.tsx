import { useState, type FormEvent } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import { Button, Field, Select } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import {
  DEFAULT_ALERT_AT,
  DEFAULT_CATEGORY_LIMIT,
  DEFAULT_TOTAL_LIMIT,
} from '../configuration/constraints';
import { newLimitId } from '../domain/ids';
import type { CategoryId, Limit } from '../domain/models';
import { useContext } from './context';
import { DetailDialog, DialogActions } from './detail-dialog';
import { limitDeleteModal } from './modal-ids';
import { categoryOf, isCategoryLimit, withoutLimit } from './selectors';

const TOTAL_SCOPE = 'total';
const TOTAL_LABEL = 'Limit miesięczny (wszystkie wydatki)';

/** Creates a limit, or edits `limit` (its scope is fixed, it can be removed). */
export const LimitForm = ({
  modal,
  limit,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  limit?: Limit;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const limits = ctx.useLimits();
  const [scope, setScope] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(limit?.amount ?? null);
  const [alertAt, setAlertAt] = useState(limit?.alertAt ?? DEFAULT_ALERT_AT);

  const options = limit
    ? [
        {
          value: isCategoryLimit(limit) ? limit.categoryId : TOTAL_SCOPE,
          label: isCategoryLimit(limit)
            ? categoryLabel(categoryOf(categories, limit.categoryId).name)
            : TOTAL_LABEL,
        },
      ]
    : [
        ...(limits.some((l) => l.scope === 'total')
          ? []
          : [{ value: TOTAL_SCOPE, label: TOTAL_LABEL }]),
        ...withoutLimit(categories, limits).map((c) => ({
          value: c.id,
          label: categoryLabel(c.name),
        })),
      ];
  const selected = options.some((o) => o.value === scope)
    ? scope
    : options[0]?.value;
  const shownAmount =
    amount ??
    (selected === TOTAL_SCOPE ? DEFAULT_TOTAL_LIMIT : DEFAULT_CATEGORY_LIMIT);
  const valid =
    Boolean(selected) &&
    shownAmount > 0 &&
    Number.isInteger(alertAt) &&
    alertAt >= 1 &&
    alertAt <= 100;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!valid || !selected) return;
    if (limit) {
      ctx.updateLimit({ ...limit, amount: shownAmount, alertAt });
    } else if (selected === TOTAL_SCOPE) {
      ctx.createLimit({
        id: newLimitId(),
        scope: 'total',
        amount: shownAmount,
        alertAt,
      });
    } else {
      ctx.createLimit({
        id: newLimitId(),
        scope: 'category',
        categoryId: selected as CategoryId,
        amount: shownAmount,
        alertAt,
      });
    }
    closeModal(modal);
  };

  return (
    <DetailDialog
      modal={modal}
      data-e2e="dashboard:limit-dialog"
      title={limit ? 'Edytuj limit' : 'Nowy limit'}
      description="Kwota miesięczna i próg powiadomień."
      onClose={() => closeModal(modal)}
    >
      <form
        onSubmit={save}
        className="space-y-3"
        data-e2e="dashboard:limit-form"
      >
        <Field label="Kategoria">
          <Select
            required
            disabled={Boolean(limit)}
            value={selected ?? ''}
            data-e2e="dashboard:limit-form-category"
            options={options}
            onValueChange={setScope}
          />
        </Field>
        <Field label="Limit miesięczny">
          <NumberInput
            required
            value={shownAmount}
            data-e2e="dashboard:limit-form-amount"
            onValueChange={setAmount}
          />
        </Field>
        <Field
          label="Powiadom od (% limitu)"
          hint="Powiadomienie w aplikacji dostaniesz zawsze. Push, jeśli włączysz go w ustawieniach."
        >
          <NumberInput
            integer
            required
            value={alertAt}
            data-e2e="dashboard:limit-form-alert-at"
            onValueChange={setAlertAt}
          />
        </Field>
        <DialogActions
          danger={
            limit ? (
              <Button
                variant="danger"
                className="w-auto"
                data-e2e="dashboard:limit-delete"
                onClick={() => openModal(limitDeleteModal(limit.id))}
              >
                Usuń limit
              </Button>
            ) : null
          }
        >
          <Button
            variant="ghost"
            className="w-auto"
            onClick={() => closeModal(modal)}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            className="w-auto"
            data-e2e="dashboard:limit-form-save"
            disabled={!valid}
          >
            Zapisz
          </Button>
        </DialogActions>
      </form>
    </DetailDialog>
  );
};
