import type { z } from 'zod';
import type { listCategoriesSchema } from '@schemas/categories';
import type { createExpenseSchema } from '@schemas/expenses';
import type { createNotificationSchema } from '@schemas/notifications';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Category,
  CategoryIconId,
  CategoryId,
  NewExpense,
  NewNotification,
} from '../domain/models';

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

type CreateExpenseBody = z.infer<ReturnType<typeof createExpenseSchema>>['in'];

type CreateNotificationBody = z.infer<
  ReturnType<typeof createNotificationSchema>
>['in'];

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  // Server validates `icon` as a non-empty string, not the closed union.
  icon: dto.icon as CategoryIconId,
  color: dto.color,
});

export const toExpenseBody = (expense: NewExpense): CreateExpenseBody => ({
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

export const toNotificationBody = (
  notification: NewNotification,
): CreateNotificationBody => ({
  id: notification.id,
  kind: notification.kind,
  title: notification.title,
  body: notification.body,
  ageDays: notification.ageDays,
});
