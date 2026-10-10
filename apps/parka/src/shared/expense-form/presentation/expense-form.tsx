import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  categoryLabel,
  MIXED_CATEGORY_LABEL,
} from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { money, toLocalDateInput, toTimestamp } from '../domain/format';
import {
  createProduct,
  defaultCategoryId,
  expenseCategoryId,
  patchProduct,
  productsTotal,
} from '../domain/products';
import type {
  Category,
  CategoryId,
  ExpenseFormValues,
  Product,
  ProductId,
} from '../domain/models';
import { ProductCard } from './product-card';

type Props = {
  /** Starting values; `null` = a blank new expense. */
  base: ExpenseFormValues | null;
  categories: Category[];
  saving: boolean;
  /** `page` = own route, `dialog` = popup over the dashboard. Same fields. */
  layout: 'page' | 'dialog';
  submitLabel: string;
  /** Extra footer buttons (cancel, delete) shown next to the submit. */
  actions?: ReactNode;
  onSubmit: (values: ExpenseFormValues) => void;
};

/** The one expense form: shop, date, amount or products. Adds and edits. */
export const ExpenseForm = ({
  base,
  categories,
  saving,
  layout,
  submitLabel,
  actions,
  onSubmit,
}: Props) => {
  const dialog = layout === 'dialog';
  const [merchant, setMerchant] = useState(base?.merchant ?? '');
  const [date, setDate] = useState(
    toLocalDateInput(base?.date ?? new Date().toISOString()),
  );
  const [method, setMethod] = useState(base?.paymentMethod ?? '');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(
    base?.categoryId ?? null,
  );
  const [amount, setAmount] = useState(base?.amount ?? 0);
  const [products, setProducts] = useState<Product[]>(base?.items ?? []);
  const [openId, setOpenId] = useState<ProductId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selected = categories.some((c) => c.id === categoryId)
    ? categoryId
    : categories[0]?.id;
  const hasProducts = products.length > 0;
  const total = hasProducts ? productsTotal(products) : amount;
  const derived = expenseCategoryId(products, selected);
  const derivedName = derived
    ? categoryLabel(categories.find((c) => c.id === derived)?.name ?? '')
    : MIXED_CATEGORY_LABEL;

  const addProduct = () => {
    const product = createProduct(
      selected ?? defaultCategoryId(categories),
      '',
    );
    setProducts([...products, product]);
    setOpenId(product.id);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || saving) return;
    const unnamed = products.find((p) => !p.name.trim());
    if (unnamed) {
      setSubmitted(true);
      setOpenId(unnamed.id);
      return;
    }
    onSubmit({
      merchant: merchant.trim(),
      date: toTimestamp(date, base?.date),
      amount: total,
      categoryId: derived,
      paymentMethod: method.trim(),
      items: products,
    });
  };

  return (
    <form
      onSubmit={save}
      className="flex flex-1 flex-col"
      data-e2e="expense-form:form"
    >
      <div
        className={cn(
          'flex flex-1 flex-col gap-4',
          !dialog &&
            'md:gap-6 lg:grid lg:grid-cols-3 lg:content-start lg:items-start',
        )}
      >
        {categories.length === 0 ? (
          <Card
            data-e2e="expense-form:no-categories"
            role="status"
            className="lg:col-span-3"
          >
            <p className="text-sm text-ink-soft">
              Aby zapisać wydatek, dodaj najpierw kategorię (np. sugerowane).
            </p>
            <a
              href={APP_ROUTER.categories()}
              className="text-sm font-medium underline"
            >
              Dodaj kategorię
            </a>
          </Card>
        ) : null}

        <Card className="space-y-3">
          <Field label="Sklep">
            <input
              className={inputClass}
              required
              value={merchant}
              placeholder="np. Biedronka"
              data-e2e="expense-form:merchant"
              onChange={(e) => setMerchant(e.target.value)}
            />
          </Field>
          <Field
            label="Kwota"
            hint={hasProducts ? 'Suma produktów poniżej.' : undefined}
          >
            <NumberInput
              required
              value={total}
              readOnly={hasProducts}
              data-e2e="expense-form:amount"
              onValueChange={setAmount}
            />
          </Field>
          <Field label="Data">
            <input
              type="date"
              className={inputClass}
              required
              value={date}
              data-e2e="expense-form:date"
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field
            label="Kategoria"
            hint={hasProducts ? 'Wynika z kategorii produktów.' : undefined}
          >
            {hasProducts ? (
              <p className={inputClass} data-e2e="expense-form:category">
                {derivedName}
              </p>
            ) : (
              <select
                className={inputClass}
                required
                value={selected ?? ''}
                data-e2e="expense-form:category"
                onChange={(e) => setCategoryId(e.target.value as CategoryId)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {categoryLabel(c.name)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Metoda płatności">
            <input
              className={inputClass}
              value={method}
              placeholder="np. Karta"
              data-e2e="expense-form:method"
              onChange={(e) => setMethod(e.target.value)}
            />
          </Field>
        </Card>

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

          {hasProducts ? (
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
                    setOpenId(openId === product.id ? null : product.id)
                  }
                  onPatch={(patch) =>
                    setProducts(patchProduct(products, product.id, patch))
                  }
                  onRemove={() =>
                    setProducts(products.filter((p) => p.id !== product.id))
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
      </div>

      <div
        className={cn(
          'mt-4 flex items-center gap-3 border-t border-line bg-card py-3',
          dialog
            ? 'flex-wrap'
            : 'sticky bottom-0 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16',
        )}
      >
        <div className="flex-1">
          <p className="text-xs text-ink-soft">Razem</p>
          <p
            className="text-lg font-bold tabular-nums"
            data-e2e="expense-form:total"
          >
            {money(total)}
          </p>
        </div>
        {actions}
        <Button
          type="submit"
          className="w-auto px-6"
          data-e2e="expense-form:save"
          disabled={saving || !selected}
        >
          {saving ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Check className="h-4 w-4" aria-hidden="true" />
          )}{' '}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
