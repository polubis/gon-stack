import type { Schema } from '@schemas/dashboard';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { CategoryId, Summary } from '../domain/models';
import { toMonth } from '../domain/format';

export const toSummary = (
  dto: InferOut<Schema['out'], 200>['data'],
): Summary => ({
  total: dto.total,
  change: dto.change,
  previousTotal: dto.previousTotal,
  rangeTotal: dto.rangeTotal,
  trend: dto.trend.map((t) => ({ month: toMonth(t.month), total: t.total })),
  categories: dto.categories.map((c) => ({
    id: c.categoryId as CategoryId,
    name: c.name,
    color: c.color,
    amount: c.amount,
    pct: c.pct,
  })),
  categoryChanges: dto.categoryChanges.map((c) => ({
    id: c.categoryId as CategoryId,
    name: c.name,
    color: c.color,
    changePct: c.changePct,
  })),
});
