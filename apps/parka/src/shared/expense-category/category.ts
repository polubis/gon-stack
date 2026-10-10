export type CategorizedItem = {
  categoryId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
};

export type CategoryShare = { categoryId: string; amount: number };

const round = (value: number): number => Number(value.toFixed(2));

/** One shared category of the items, else `null`; no items keep `manualId`. */
export const deriveExpenseCategory = (
  items: Pick<CategorizedItem, 'categoryId'>[],
  manualId: string | null,
): string | null => {
  if (items.length === 0) return manualId;
  const first = items[0].categoryId;
  return items.every((item) => item.categoryId === first) ? first : null;
};

/** How an expense amount splits across categories, largest first. */
export const categoryShares = (expense: {
  amount: number;
  categoryId: string | null;
  items: CategorizedItem[];
}): CategoryShare[] => {
  if (expense.categoryId) {
    return [{ categoryId: expense.categoryId, amount: expense.amount }];
  }
  const totals = new Map<string, number>();
  for (const item of expense.items) {
    const amount = item.unitPrice * item.quantity - item.discount;
    totals.set(item.categoryId, (totals.get(item.categoryId) ?? 0) + amount);
  }
  return [...totals]
    .map(([categoryId, amount]) => ({ categoryId, amount: round(amount) }))
    .sort((a, b) => b.amount - a.amount);
};
