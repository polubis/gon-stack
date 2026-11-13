import { useState } from 'react';
import { openModal } from '@/shared/router/modal-stack';
import {
  categoryLabel,
  MIXED_CATEGORY_LABEL,
} from '@/shared/i18n/category-label';
import { expenseCategoryId, productsTotal } from '../domain/products';
import type { Category, CategoryId, Product } from '../domain/models';
import { productModal } from './product-modal-id';

/**
 * State of a product list inside a form: the products and
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
  const [submitted, setSubmitted] = useState(false);

  const hasProducts = products.length > 0;
  const derived = expenseCategoryId(products, manualCategoryId);

  /** `true` when every product is named; else opens the editor of the first unnamed one. */
  const validate = (): boolean => {
    const unnamed = products.find((p) => !p.name.trim());
    if (!unnamed) return true;
    setSubmitted(true);
    openModal(productModal(unnamed.id));
    return false;
  };

  return {
    products,
    setProducts,
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
