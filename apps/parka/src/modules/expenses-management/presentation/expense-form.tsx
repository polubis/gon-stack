import { useState, type FormEvent } from 'react';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import {
  categoryLabel,
  MIXED_CATEGORY_LABEL,
} from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { money, toLocalDateInput, toTimestamp } from '../domain/format';
import { newExpenseId } from '../domain/ids';
import {
  createProduct,
  defaultCategoryId,
  expenseCategoryId,
  patchProduct,
  productsFromDraft,
  productsTotal,
} from '../domain/products';
import type {
  CategoryId,
  Product,
  ProductId,
  ReceiptDraft,
} from '../domain/models';
import { useContext } from './context';
import { ProductCard } from './product-card';

/** Normal expense: shop, date, amount or products. Starts from a scan when given. */
export const ExpenseForm = ({ draft }: { draft: ReceiptDraft | null }) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const saving = ctx.useSaving();
  const [merchant, setMerchant] = useState(draft?.merchant ?? '');
  const [date, setDate] = useState(
    toLocalDateInput(draft?.date ?? new Date().toISOString()),
  );
  const [method, setMethod] = useState(draft?.paymentMethod ?? '');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [amount, setAmount] = useState(draft?.amount ?? 0);
  const [products, setProducts] = useState<Product[]>(() =>
    draft ? productsFromDraft(draft, defaultCategoryId(categories)) : [],
  );
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
    ctx.createExpense({
      id: newExpenseId(),
      merchant: merchant.trim(),
      date: toTimestamp(date, draft?.date),
      amount: total,
      categoryId: derived,
      paymentMethod: method.trim(),
      isBill: false,
      source: draft ? 'receipt' : 'manual',
      items: products,
    });
  };

  return (
    <form
      onSubmit={save}
      className="flex flex-1 flex-col"
      data-e2e="expenses-management:expense-form"
    >
      <div className="flex flex-1 flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-3 lg:content-start lg:items-start">
        {categories.length === 0 ? (
          <Card
            data-e2e="expenses-management:no-categories"
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
              data-e2e="expenses-management:merchant"
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
              data-e2e="expenses-management:amount"
              onValueChange={setAmount}
            />
          </Field>
          <Field label="Data">
            <input
              type="date"
              className={inputClass}
              required
              value={date}
              data-e2e="expenses-management:date"
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field
            label="Kategoria"
            hint={hasProducts ? 'Wynika z kategorii produktów.' : undefined}
          >
            {hasProducts ? (
              <p className={inputClass} data-e2e="expenses-management:category">
                {derivedName}
              </p>
            ) : (
              <select
                className={inputClass}
                required
                value={selected ?? ''}
                data-e2e="expenses-management:category"
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
              data-e2e="expenses-management:method"
              onChange={(e) => setMethod(e.target.value)}
            />
          </Field>
        </Card>

        <section
          aria-labelledby="products-heading"
          className="space-y-2 lg:col-span-2"
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
              data-e2e="expenses-management:add-product"
              onClick={addProduct}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj produkt
            </button>
          </div>

          {hasProducts ? (
            <ul className="space-y-2 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
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

      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center gap-3 border-t border-line bg-card px-4 py-3 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16">
        <div className="flex-1">
          <p className="text-xs text-ink-soft">Razem</p>
          <p
            className="text-lg font-bold tabular-nums"
            data-e2e="expenses-management:total"
          >
            {money(total)}
          </p>
        </div>
        <Button
          type="submit"
          className="w-auto px-6"
          data-e2e="expenses-management:save"
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
          Dodaj wydatek
        </Button>
      </div>
    </form>
  );
};
