import { Plus } from 'lucide-react';
import {
  closeModal,
  closeModalThen,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { createProduct, patchProduct } from '../domain/products';
import type { Category, CategoryId, Product } from '../domain/models';
import { ProductCard } from './product-card';
import { ProductDialog } from './product-dialog';
import { productModal } from './product-modal-id';

type Props = {
  products: Product[];
  categories: Category[];
  /** Category a freshly added product starts with. */
  newProductCategoryId: CategoryId;
  /** Marks unnamed products invalid (after a save attempt). */
  submitted: boolean;
  onChange: (products: Product[]) => void;
};

/** Products of an expense or of a recurring rule: add, edit, remove. */
export const ProductsSection = ({
  products,
  categories,
  newProductCategoryId,
  submitted,
  onChange,
}: Props) => {
  const stack = useModalStack();

  const addProduct = () => {
    const product = createProduct(newProductCategoryId, '');
    onChange([...products, product]);
    openModal(productModal(product.id));
  };

  return (
    <section aria-labelledby="products-heading" className="space-y-2">
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
        <ul className="space-y-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categories={categories}
              onEdit={() => openModal(productModal(product.id))}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-soft">
          Opcjonalnie dodaj produkty. Wtedy kwota policzy się sama.
        </p>
      )}
      {products.map((product) => {
        const id = productModal(product.id);
        return stack.includes(id) ? (
          <ProductDialog
            key={product.id}
            modal={id}
            product={product}
            categories={categories}
            invalid={submitted && !product.name.trim()}
            onPatch={(patch) =>
              onChange(patchProduct(products, product.id, patch))
            }
            onRemove={() =>
              closeModalThen(id, () =>
                onChange(products.filter((p) => p.id !== product.id)),
              )
            }
            onClose={() => closeModal(id)}
          />
        ) : null;
      })}
    </section>
  );
};
