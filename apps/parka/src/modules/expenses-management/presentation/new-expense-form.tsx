import { useEffect } from 'react';
import { ExpenseForm } from '@/shared/expense-form/presentation/expense-form';
import { productsFromDraft } from '@/shared/expense-form/domain/products';
import type { ExpenseFormValues } from '@/shared/expense-form/domain/models';
import { dayAtCurrentTime } from '@/shared/date/date';
import {
  currentDevice,
  loadDeviceHints,
} from '@/shared/device/integration/current-device';
import { newExpenseId } from '../domain/ids';
import type { ReceiptDraft, StoredExpense } from '../domain/models';
import { useContext } from './context';

/** Adds an expense through the shared form; starts from a scan or a copied expense. */
export const NewExpenseForm = ({
  draft,
  source,
}: {
  draft: ReceiptDraft | null;
  source: StoredExpense | null;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const saving = ctx.useSaving();

  // The model code is async; have it by the time the user submits.
  useEffect(() => {
    void loadDeviceHints();
  }, []);

  // A copy keeps every field but gets today's date and fresh product ids.
  const base: ExpenseFormValues | null = source
    ? {
        merchant: source.merchant,
        date: new Date().toISOString(),
        amount: source.amount,
        categoryId: source.categoryId,
        paymentMethod: source.paymentMethod,
        items: productsFromDraft(source.items, categories),
      }
    : draft
      ? {
          merchant: draft.merchant,
          date: dayAtCurrentTime(draft.date),
          amount: draft.amount,
          categoryId: null,
          paymentMethod: draft.paymentMethod ?? '',
          items: productsFromDraft(draft.items, categories),
        }
      : null;

  return (
    <ExpenseForm
      base={base}
      categories={categories}
      saving={saving}
      layout="page"
      prefill={!source}
      submitLabel="Dodaj wydatek"
      onSubmit={(values) =>
        ctx.createExpense({
          ...values,
          id: newExpenseId(),
          isBill: false,
          source: draft ? 'receipt' : 'manual',
          device: currentDevice(),
        })
      }
    />
  );
};
