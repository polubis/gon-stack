import { deriveExpenseCategory } from '@/shared/expense-category/category';
import { NO_CATEGORY, UNCATEGORIZED } from '../configuration/constraints';
import { newProductId } from './ids';
import type {
  Category,
  CategoryId,
  Product,
  ProductId,
  ReceiptDraft,
} from './models';

export const productTotal = (
  product: Pick<Product, 'unitPrice' | 'quantity' | 'discount'>,
): number => product.unitPrice * product.quantity - product.discount;

export const productsTotal = (products: Product[]): number =>
  Number(products.reduce((sum, p) => sum + productTotal(p), 0).toFixed(2));

export const createProduct = (
  categoryId: CategoryId,
  name: string,
): Product => ({
  id: newProductId(),
  name,
  unitPrice: 0,
  quantity: 1,
  discount: 0,
  categoryId,
});

export const productsFromDraft = (
  draft: ReceiptDraft,
  categoryId: CategoryId,
): Product[] =>
  draft.items.map((item) => ({ ...item, id: newProductId(), categoryId }));

export const patchProduct = (
  products: Product[],
  id: ProductId,
  patch: Partial<Omit<Product, 'id'>>,
): Product[] => products.map((p) => (p.id === id ? { ...p, ...patch } : p));

/** Category the products share, `null` when they differ; `manual` without any. */
export const expenseCategoryId = (
  products: Product[],
  manual: CategoryId | null | undefined,
): CategoryId | null =>
  deriveExpenseCategory(products, manual ?? null) as CategoryId | null;

export const defaultCategoryId = (categories: Category[]): CategoryId =>
  categories[0]?.id ?? NO_CATEGORY;

/** Matching category, else the first one, else a placeholder. */
export const resolveCategory = (
  categories: Category[],
  id: CategoryId,
): Category =>
  categories.find((c) => c.id === id) ?? categories[0] ?? UNCATEGORIZED;
