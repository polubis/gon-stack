import type { Category, CategoryId, Recurring, Tab } from '../domain/models';

/** Shown for recurring items when no category exists. */
export const UNCATEGORIZED: Category = {
  id: '' as CategoryId,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: '#4b5a52',
};

/** Matching category, else the first one, else a placeholder. */
export const resolveCategory = (
  categories: Category[],
  id: CategoryId,
): Category =>
  categories.find((c) => c.id === id) ?? categories[0] ?? UNCATEGORIZED;

export const filterByTab = (list: Recurring[], tab: Tab): Recurring[] =>
  tab === 'active' ? list.filter((r) => r.active) : list;
