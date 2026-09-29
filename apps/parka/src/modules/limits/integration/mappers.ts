import type { z } from 'zod';
import type { listLimitsSchema } from '@schemas/limits';
import type { listGoalsSchema } from '@schemas/goals';
import type { listCategoriesSchema } from '@schemas/categories';
import type { listExpensesSchema } from '@schemas/expenses';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Category,
  CategoryIconId,
  CategoryId,
  Expense,
  ExpenseId,
  Goal,
  GoalId,
  Limit,
  LimitId,
} from '../domain/models';

type LimitDto = InferOut<
  z.infer<ReturnType<typeof listLimitsSchema>>['out'],
  200
>['data'][number];

type GoalDto = InferOut<
  z.infer<ReturnType<typeof listGoalsSchema>>['out'],
  200
>['data'][number];

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

type ExpenseDto = InferOut<
  z.infer<ReturnType<typeof listExpensesSchema>>['out'],
  200
>['data'][number];

export const toLimit = (dto: LimitDto): Limit => {
  const base = {
    id: dto.id as LimitId,
    amount: dto.amount,
    alertAt80: dto.alertAt80,
    delivery: dto.delivery,
  };
  return dto.scope === 'category' && dto.categoryId
    ? { ...base, scope: 'category', categoryId: dto.categoryId as CategoryId }
    : { ...base, scope: 'total' };
};

export const toGoal = (dto: GoalDto): Goal => ({
  id: dto.id as GoalId,
  name: dto.name,
  target: dto.target,
  saved: dto.saved,
  months: dto.months,
});

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  // Server validates `icon` as a non-empty string, not the closed union.
  icon: dto.icon as CategoryIconId,
  color: dto.color,
});

export const toExpense = (dto: ExpenseDto): Expense => ({
  id: dto.id as ExpenseId,
  date: dto.date,
  amount: dto.amount,
  categoryId: dto.categoryId as CategoryId,
});
