import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { createProduct, patchProduct } from '../domain/products';
import type {
  Category,
  CategoryId,
  Product,
  ProductId,
} from '../domain/models';
import { ProductCard } from './product-card';

type Props = {
  products: Product[];
  categories: Category[];
  /** Category a freshly added product starts with. */
  newProductCategoryId: CategoryId;
  /** `page` = own route (wide grid), `dialog` = popup. */
  layout: 'page' | 'dialog';
  /** Marks unnamed products invalid (after a save attempt). */
  submitted: boolean;
  openId: ProductId | null;
  onOpenIdChange: (id: ProductId | null) => void;
  onChange: (products: Product[]) => void;
};

/** Products of an expense or of a recurring rule: add, edit, remove. */
export const ProductsSection = ({
  products,
  categories,
  newProductCategoryId,
  layout,
  submitted,
  openId,
  onOpenIdChange,
  onChange,
}: Props) => {
  const dialog = layout === 'dialog';

  const addProduct = () => {
    const product = createProduct(newProductCategoryId, '');
    onChange([...products, product]);
    onOpenIdChange(product.id);
  };

  return (
    <section
      aria-labelledby="products-heading"
      className={cn('space-y-2', !dialog && 'lg:col-span-2')}
    >
      <div className="flex items-center justify-between">
        <h2
          id="products-heading"
          className="text-sm font-semibold text-ink-soft"
        >
          Produkty ({products.length})
        </h2>
        <button
          type="button"
          data-e2e="expense-form:add-product"
          onClick={addProduct}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj produkt
        </button>
      </div>

      {products.length > 0 ? (
        <ul
          className={cn(
            'space-y-2',
            !dialog &&
              'md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0',
          )}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categories={categories}
              open={openId === product.id}
              invalid={submitted && !product.name.trim()}
              onToggle={() =>
                onOpenIdChange(openId === product.id ? null : product.id)
              }
              onPatch={(patch) =>
                onChange(patchProduct(products, product.id, patch))
              }
              onRemove={() =>
                onChange(products.filter((p) => p.id !== product.id))
              }
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-soft">
          Opcjonalnie dodaj produkty. Wtedy kwota policzy się sama.
        </p>
      )}
    </section>
  );
};
