import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type CategoryId = Brand<string, 'CategoryId'>;
export type ProductId = Brand<string, 'ProductId'>;

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type Product = {
  id: ProductId;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: CategoryId;
};

/** What the form edits; the same shape for a new and for a stored expense. */
export type ExpenseFormValues = {
  merchant: string;
  /** ISO date-time string. */
  date: string;
  amount: number;
  /** `null` when its products come from different categories. */
  categoryId: CategoryId | null;
  paymentMethod: string;
  items: Product[];
};
