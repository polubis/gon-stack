export type DashboardTrendPoint = { month: string; total: number };

export type DashboardCategorySlice = {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type DashboardSummary = {
  total: number;
  change: number;
  trend: DashboardTrendPoint[];
  categories: DashboardCategorySlice[];
};

export type QuickActionIconId = 'add' | 'camera' | 'target' | 'repeat';

export type QuickAction = {
  label: string;
  href: string;
  iconId: QuickActionIconId;
};
