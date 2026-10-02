import type { z } from 'zod';
import type { Schema } from '@schemas/dashboard';
import type { listExpensesSchema } from '@schemas/expenses';
import type { listCategoriesSchema } from '@schemas/categories';
import type { listLimitsSchema } from '@schemas/limits';
import type { listGoalsSchema } from '@schemas/goals';
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
  ReceiptItemId,
  Summary,
} from '../domain/models';

type ExpenseDto = InferOut<
  z.infer<ReturnType<typeof listExpensesSchema>>['out'],
  200
>['data'][number];

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

type LimitDto = InferOut<
  z.infer<ReturnType<typeof listLimitsSchema>>['out'],
  200
>['data'][number];

type GoalDto = InferOut<
  z.infer<ReturnType<typeof listGoalsSchema>>['out'],
  200
>['data'][number];

export const toSummary = (
  dto: InferOut<Schema['out'], 200>['data'],
): Summary => ({
  userName: dto.userName,
  total: dto.total,
  change: dto.change,
  previousTotal: dto.previousTotal,
  transactions: dto.transactions,
  dailyAverage: dto.dailyAverage,
  daily: dto.daily,
  previousDaily: dto.previousDaily,
  monthlyLimit: dto.monthlyLimit,
  categories: dto.categories.map((c) => ({
    id: c.categoryId as CategoryId,
    name: c.name,
    color: c.color,
    amount: c.amount,
    pct: c.pct,
  })),
});

export const toExpense = (dto: ExpenseDto): Expense => ({
  id: dto.id as ExpenseId,
  merchant: dto.merchant,
  date: dto.date,
  amount: dto.amount,
  categoryId: dto.categoryId as CategoryId,
  paymentMethod: dto.paymentMethod,
  isBill: dto.isBill,
  source: dto.source,
  items: dto.items.map((item) => ({
    id: item.id as ReceiptItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    discount: item.discount,
    categoryId: item.categoryId as CategoryId,
  })),
});

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  // Server validates `icon` as a non-empty string, not the closed union.
  icon: dto.icon as CategoryIconId,
  color: dto.color,
});

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
