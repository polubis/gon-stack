import type { z } from 'zod';
import type { listRecurringSchema } from '@schemas/recurring';
import type { listCategoriesSchema } from '@schemas/categories';
import type { InferOut } from '@/shared/server-contracts/extraction';
import {
  CATEGORY_ICON_IDS,
  type Category,
  type CategoryIconId,
  type CategoryId,
  type Recurring,
  type RecurringId,
} from '../domain/models';

type RecurringDto = InferOut<
  z.infer<ReturnType<typeof listRecurringSchema>>['out'],
  200
>['data'][number];

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

const FALLBACK_ICON: CategoryIconId = 'sparkles';

const toIcon = (value: string): CategoryIconId =>
  CATEGORY_ICON_IDS.find((id) => id === value) ?? FALLBACK_ICON;

export const toRecurring = (dto: RecurringDto): Recurring => ({
  id: dto.id as RecurringId,
  name: dto.name,
  cost: dto.cost,
  nextPaymentDate: dto.nextPaymentDate,
  active: dto.active,
  paymentMethod: dto.paymentMethod,
  categoryId: dto.categoryId as CategoryId,
  history: dto.history.map((h) => ({ date: h.date, amount: h.amount })),
});

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  icon: toIcon(dto.icon),
  color: dto.color,
});
