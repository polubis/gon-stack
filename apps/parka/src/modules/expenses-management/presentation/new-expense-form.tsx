import { ExpenseForm } from '@/shared/expense-form/presentation/expense-form';
import {
  defaultCategoryId,
  productsFromDraft,
} from '@/shared/expense-form/domain/products';
import type { ExpenseFormValues } from '@/shared/expense-form/domain/models';
import { newExpenseId } from '../domain/ids';
import type { ReceiptDraft } from '../domain/models';
import { useContext } from './context';

/** Adds an expense through the shared form; starts from a scan when given. */
export const NewExpenseForm = ({ draft }: { draft: ReceiptDraft | null }) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const saving = ctx.useSaving();

  const base: ExpenseFormValues | null = draft
    ? {
        merchant: draft.merchant,
        date: draft.date,
        amount: draft.amount,
        categoryId: null,
        paymentMethod: draft.paymentMethod ?? '',
        items: productsFromDraft(draft.items, defaultCategoryId(categories)),
      }
    : null;

  return (
    <ExpenseForm
      base={base}
      categories={categories}
      saving={saving}
      layout="page"
      submitLabel="Dodaj wydatek"
      onSubmit={(values) =>
        ctx.createExpense({
          ...values,
          id: newExpenseId(),
          isBill: false,
          source: draft ? 'receipt' : 'manual',
        })
      }
    />
  );
};
