import { ChevronRight } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Card } from '@/shared/ui/layout';
import { money } from '../domain/format';
import { productTotal, resolveCategory } from '../domain/products';
import type { Category, Product } from '../domain/models';

type Props = {
  product: Product;
  categories: Category[];
  /** Opens the product's editor popup. */
  onEdit: () => void;
};

/** One product row: summary only, editing happens in `ProductDialog`. */
export const ProductCard = ({ product, categories, onEdit }: Props) => {
  const category = resolveCategory(categories, product.categoryId);

  return (
    <Card as="li">
      <button
        type="button"
        onClick={onEdit}
        data-e2e={`expense-form:product-toggle:${product.id}`}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 text-left"
      >
        <CategoryAvatar category={category} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {product.name || 'Bez nazwy'}
          </span>
          <span className="block text-xs text-ink-soft">
            {categoryLabel(category.name)}
          </span>
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {money(productTotal(product))}
        </span>
        <ChevronRight className="h-4 w-4 text-ink-soft" aria-hidden="true" />
      </button>
    </Card>
  );
};
