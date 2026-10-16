import { useState } from 'react';
import {
  categoryLabel,
  MIXED_CATEGORY_LABEL,
} from '@/shared/i18n/category-label';
import { expenseCategoryId, productsTotal } from '../domain/products';
import type {
  Category,
  CategoryId,
  Product,
  ProductId,
} from '../domain/models';

/**
 * State of a product list inside a form: the products, the open card, and
 * what they imply (total, shared category). Without products `total` is
 * `manualAmount` and the category stays `manualCategoryId`.
 */
export const useProducts = ({
  initial,
  categories,
  manualAmount,
  manualCategoryId,
}: {
  initial: Product[];
  categories: Category[];
  manualAmount: number;
  manualCategoryId: CategoryId | null | undefined;
}) => {
  const [products, setProducts] = useState(initial);
  const [openId, setOpenId] = useState<ProductId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const hasProducts = products.length > 0;
  const derived = expenseCategoryId(products, manualCategoryId);

  /** `true` when every product is named; else opens the first unnamed one. */
  const validate = (): boolean => {
    const unnamed = products.find((p) => !p.name.trim());
    if (!unnamed) return true;
    setSubmitted(true);
    setOpenId(unnamed.id);
    return false;
  };

  return {
    products,
    setProducts,
    openId,
    setOpenId,
    submitted,
    hasProducts,
    total: hasProducts ? productsTotal(products) : manualAmount,
    derivedCategoryId: derived,
    derivedCategoryName: derived
      ? categoryLabel(categories.find((c) => c.id === derived)?.name ?? '')
      : MIXED_CATEGORY_LABEL,
    validate,
  };
};
