import { ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { categoryLabel } from '@/shared/i18n/category-label';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Field, inputClass } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { money } from '../domain/format';
import { productTotal, resolveCategory } from '../domain/products';
import type { Category, Product } from '../domain/models';

type Props = {
  product: Product;
  categories: Category[];
  open: boolean;
  invalid: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<Omit<Product, 'id'>>) => void;
  onRemove: () => void;
};

export const ProductCard = ({
  product,
  categories,
  open,
  invalid,
  onToggle,
  onPatch,
  onRemove,
}: Props) => {
  const category = resolveCategory(categories, product.categoryId);

  return (
    <Card as="li" className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
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
        <ChevronDown
          className={cn(
            'h-4 w-4 text-ink-soft transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
          <div className="col-span-2">
            <Field
              label="Nazwa produktu"
              hint={invalid ? 'Podaj nazwę produktu.' : undefined}
            >
              <input
                className={inputClass}
                value={product.name}
                required
                aria-invalid={invalid}
                autoFocus={invalid}
                data-e2e={`expenses-management:product-name:${product.id}`}
                onChange={(e) => onPatch({ name: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Cena">
            <NumberInput
              value={product.unitPrice}
              data-e2e={`expenses-management:product-price:${product.id}`}
              onValueChange={(unitPrice) => onPatch({ unitPrice })}
            />
          </Field>
          <Field label="Ilość">
            <NumberInput
              integer
              value={product.quantity}
              data-e2e={`expenses-management:product-qty:${product.id}`}
              onValueChange={(quantity) => onPatch({ quantity })}
            />
          </Field>
          <Field label="Rabat">
            <NumberInput
              value={product.discount}
              data-e2e={`expenses-management:product-discount:${product.id}`}
              onValueChange={(discount) => onPatch({ discount })}
            />
          </Field>
          <Field label="Kategoria produktu">
            <select
              className={inputClass}
              value={product.categoryId}
              data-e2e={`expenses-management:product-category:${product.id}`}
              onChange={(e) => {
                const next = categories.find((c) => c.id === e.target.value);
                if (next) onPatch({ categoryId: next.id });
              }}
            >
              {categories.length === 0 ? (
                <option value={product.categoryId}>Bez kategorii</option>
              ) : null}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c.name)}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            data-e2e={`expenses-management:product-remove:${product.id}`}
            onClick={onRemove}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-danger hover:bg-danger-faint"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń produkt
          </button>
        </div>
      ) : null}
    </Card>
  );
};
