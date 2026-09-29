import type { z } from 'zod';
import type { listExpensesSchema } from '@schemas/expenses';
import type { listCategoriesSchema } from '@schemas/categories';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
} from '../domain/models';

export type ExpenseDto = InferOut<
  z.infer<ReturnType<typeof listExpensesSchema>>['out'],
  200
>['data'][number];

export type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

export const toExpense = (dto: ExpenseDto): Expense => ({
  id: dto.id as ExpenseId,
  merchant: dto.merchant,
  date: dto.date,
  amount: dto.amount,
  categoryId: dto.categoryId as CategoryId,
  paymentMethod: dto.paymentMethod,
});

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
});
