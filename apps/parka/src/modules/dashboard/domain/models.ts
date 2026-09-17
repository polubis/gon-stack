import type { Brand } from '@repo/type-beast/brand';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;

export type TrendPoint = { month: Month; total: number };

export type CategorySlice = {
  id: CategoryId;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type Summary = {
  total: number;
  change: number;
  trend: TrendPoint[];
  categories: CategorySlice[];
};

export type QuickActionIconId = 'add' | 'camera' | 'target' | 'repeat';

export type QuickAction = {
  label: string;
  href: string;
  iconId: QuickActionIconId;
};
