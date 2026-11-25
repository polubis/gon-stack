import type { Category, CategoryId } from './models';

export type CategoryGroup<T> = {
  /** `null` collects rows whose category no longer exists. */
  category: Category | null;
  rows: T[];
};

/** Rows split per category, groups in the order of `categories`, rows keep their order. */
export const groupByCategory = <T extends { item: { categoryId: CategoryId } }>(
  rows: readonly T[],
  categories: readonly Category[],
): CategoryGroup<T>[] => {
  const groups = categories
    .map((category) => ({
      category: category as Category | null,
      rows: rows.filter((row) => row.item.categoryId === category.id),
    }))
    .filter((group) => group.rows.length > 0);
  const known = new Set(categories.map((category) => category.id));
  const orphans = rows.filter((row) => !known.has(row.item.categoryId));
  return orphans.length > 0
    ? [...groups, { category: null, rows: orphans }]
    : groups;
};
