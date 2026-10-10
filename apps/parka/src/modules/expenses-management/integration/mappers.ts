import type { z } from 'zod';
import type { listCategoriesSchema } from '@schemas/categories';
import type {
  createExpenseSchema,
  listExpensesSchema,
} from '@schemas/expenses';
import type { createRecurringSchema } from '@schemas/recurring';
import type { scanReceiptSchema } from '@schemas/receipts';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Category,
  CategoryIconId,
  CategoryId,
  ExpenseId,
  ProductId,
  NewExpense,
  StoredExpense,
  NewRecurring,
  ReceiptDraft,
} from '../domain/models';

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

type ReceiptDraftDto = InferOut<
  z.infer<ReturnType<typeof scanReceiptSchema>>['out'],
  200
>['data'];

type ExpenseDto = InferOut<
  z.infer<ReturnType<typeof listExpensesSchema>>['out'],
  200
>['data'][number];

type CreateExpenseBody = z.infer<ReturnType<typeof createExpenseSchema>>['in'];

type CreateRecurringBody = z.infer<
  ReturnType<typeof createRecurringSchema>
>['in'];

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  // Server validates `icon` as a non-empty string, not the closed union.
  icon: dto.icon as CategoryIconId,
  color: dto.color,
});

export const toReceiptDraft = (dto: ReceiptDraftDto): ReceiptDraft => ({
  merchant: dto.merchant,
  date: dto.date,
  amount: dto.amount,
  paymentMethod: dto.paymentMethod,
  items: dto.items.map(({ name, unitPrice, quantity, discount }) => ({
    name,
    unitPrice,
    quantity,
    discount,
  })),
});

export const toStoredExpense = (dto: ExpenseDto): StoredExpense => ({
  id: dto.id as ExpenseId,
  merchant: dto.merchant,
  date: dto.date,
  amount: dto.amount,
  categoryId: dto.categoryId as CategoryId | null,
  paymentMethod: dto.paymentMethod,
  isBill: dto.isBill,
  source: dto.source,
  items: dto.items.map((item) => ({
    id: item.id as ProductId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    discount: item.discount,
    categoryId: item.categoryId as CategoryId,
  })),
});

export const toExpenseBody = (
  expense: NewExpense | StoredExpense,
): CreateExpenseBody => ({
  id: expense.id,
  merchant: expense.merchant,
  date: expense.date,
  amount: expense.amount,
  categoryId: expense.categoryId,
  paymentMethod: expense.paymentMethod,
  isBill: expense.isBill,
  source: expense.source,
  items: expense.items.map((item) => ({
    id: item.id,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    discount: item.discount,
    categoryId: item.categoryId,
  })),
});

export const toRecurringBody = (
  recurring: NewRecurring,
): CreateRecurringBody => ({
  id: recurring.id,
  name: recurring.name,
  cost: recurring.cost,
  nextPaymentDate: recurring.nextPaymentDate,
  active: recurring.active,
  paymentMethod: recurring.paymentMethod,
  categoryId: recurring.categoryId,
  history: recurring.history,
});
