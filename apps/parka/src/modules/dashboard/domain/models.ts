import type { Brand } from '@repo/type-beast/brand';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;

export type Range = '1' | '3' | '6' | '12';

export type TrendPoint = { month: Month; total: number };

export type CategorySlice = {
  id: CategoryId;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type CategoryChange = {
  id: CategoryId;
  name: string;
  color: string;
  changePct: number;
};

export type Summary = {
  /** Selected month total. */
  total: number;
  /** Selected month vs previous month, in percent. */
  change: number;
  previousTotal: number;
  /** Total across the selected range. */
  rangeTotal: number;
  trend: TrendPoint[];
  /** Breakdown across the selected range. */
  categories: CategorySlice[];
  /** Biggest category moves, selected month vs previous month. */
  categoryChanges: CategoryChange[];
};

export type QuickActionIconId = 'add' | 'camera' | 'target' | 'repeat';

export type QuickAction = {
  label: string;
  href: string;
  iconId: QuickActionIconId;
};
