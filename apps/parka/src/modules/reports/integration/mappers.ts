import type { z } from 'zod';
import type { listExpensesSchema } from '@schemas/expenses';
import type { listCategoriesSchema } from '@schemas/categories';
import type { listRecurringSchema } from '@schemas/recurring';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
  Recurring,
  RecurringId,
} from '../domain/models';

type ExpenseDto = InferOut<
  z.infer<ReturnType<typeof listExpensesSchema>>['out'],
  200
>['data'][number];

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

type RecurringDto = InferOut<
  z.infer<ReturnType<typeof listRecurringSchema>>['out'],
  200
>['data'][number];

export const toExpense = (dto: ExpenseDto): Expense => ({
  id: dto.id as ExpenseId,
  merchant: dto.merchant,
  date: dto.date,
  amount: dto.amount,
  categoryId: dto.categoryId as CategoryId | null,
  categoryIds: [
    ...new Set([
      ...(dto.categoryId ? [dto.categoryId] : []),
      ...dto.items.map((item) => item.categoryId),
    ]),
  ] as CategoryId[],
  isBill: dto.isBill,
});

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
});

export const toRecurring = (dto: RecurringDto): Recurring => ({
  id: dto.id as RecurringId,
  active: dto.active,
});
