import { ClearableInput } from '@/shared/ui/clearable';
import { useState, type FormEvent } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, Input, Select, inputClass } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { ProductsSection } from '@/shared/expense-form/presentation/products-section';
import { useProducts } from '@/shared/expense-form/presentation/use-products';
import {
  defaultCategoryId,
  productsFromDraft,
} from '@/shared/expense-form/domain/products';
import { today } from '@/shared/date/date';
import { newRecurringId } from '../domain/ids';
import type {
  CategoryId,
  ReceiptDraft,
  RecurringInterval,
} from '../domain/models';

const INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: 'weekly', label: 'Co tydzień' },
  { value: 'monthly', label: 'Co miesiąc' },
  { value: 'yearly', label: 'Co rok' },
];
import { useContext } from './context';

/**
 * Recurring expense: a rule, not an expense. A payment becomes an expense
 * only once its day has passed; until then it is just announced.
 */
export const RecurringForm = ({ draft }: { draft: ReceiptDraft | null }) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const saving = ctx.useSaving();
  const [name, setName] = useState(draft?.merchant ?? '');
  const [cost, setCost] = useState(0);
  const [frequency, setFrequency] = useState<RecurringInterval>('monthly');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [method, setMethod] = useState(draft?.paymentMethod ?? '');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);

  const selected = categories.some((c) => c.id === categoryId)
    ? categoryId
    : categories[0]?.id;
  const {
    products,
    setProducts,
    openId,
    setOpenId,
    submitted,
    hasProducts,
    total,
    derivedCategoryId,
    derivedCategoryName,
    validate,
  } = useProducts({
    initial: draft ? productsFromDraft(draft.items, categories) : [],
    categories,
    manualAmount: cost,
    manualCategoryId: selected,
  });

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || saving || !validate()) return;
    ctx.createRecurring({
      id: newRecurringId(),
      name: name.trim(),
      cost: total,
      interval: frequency,
      startDate,
      endDate: endDate || null,
      active: true,
      paymentMethod: method.trim(),
      categoryId: derivedCategoryId,
      items: products,
    });
  };

  return (
    <form
      onSubmit={save}
      className="flex flex-1 flex-col"
      data-e2e="expenses-management:recurring-form"
    >
      <div className="flex flex-1 flex-col gap-4">
        {categories.length === 0 ? (
          <Card data-e2e="expenses-management:no-categories" role="status">
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

        <Card className="max-w-xl space-y-3">
          <p className="text-sm text-ink-soft">
            Wydatek powstanie w dniu płatności. Do tego czasu będzie tylko
            nadchodzący i nie wliczy się do podsumowania ani limitów.
          </p>
          <Field label="Nazwa">
            <ClearableInput
              required
              value={name}
              placeholder="np. Netflix"
              data-e2e="expenses-management:recurring-name"
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field
            label="Koszt płatności"
            hint={hasProducts ? 'Suma produktów poniżej.' : undefined}
          >
            <NumberInput
              required
              value={total}
              readOnly={hasProducts}
              data-e2e="expenses-management:recurring-cost"
              onValueChange={setCost}
            />
          </Field>
          <Field label="Częstotliwość">
            <Select
              value={frequency}
              data-e2e="expenses-management:recurring-interval"
              options={INTERVALS}
              onValueChange={(value) =>
                setFrequency(value as RecurringInterval)
              }
            />
          </Field>
          <Field
            label="Pierwsza płatność"
            hint="Płatność w przeszłości od razu nalicza minione terminy."
          >
            <Input
              type="date"
              required
              value={startDate}
              data-e2e="expenses-management:recurring-date"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field
            label="Koniec (opcjonalnie)"
            hint="Po tym dniu płatność się nie powtarza. Puste = bez końca."
          >
            <Input
              type="date"
              value={endDate}
              min={startDate}
              data-e2e="expenses-management:recurring-end"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
          <Field
            label="Kategoria"
            hint={hasProducts ? 'Wynika z kategorii produktów.' : undefined}
          >
            {hasProducts ? (
              <p
                className={inputClass}
                data-e2e="expenses-management:recurring-category"
              >
                {derivedCategoryName}
              </p>
            ) : (
              <Select
                required
                value={selected ?? ''}
                data-e2e="expenses-management:recurring-category"
                options={categories.map((c) => ({
                  value: c.id,
                  label: categoryLabel(c.name),
                }))}
                onValueChange={(id) => setCategoryId(id as CategoryId)}
              />
            )}
          </Field>
          <Field label="Metoda płatności">
            <ClearableInput
              value={method}
              placeholder="np. Karta"
              data-e2e="expenses-management:recurring-method"
              onChange={(e) => setMethod(e.target.value)}
            />
          </Field>
        </Card>

        <div className="max-w-xl">
          <ProductsSection
            products={products}
            categories={categories}
            newProductCategoryId={selected ?? defaultCategoryId(categories)}
            layout="dialog"
            submitted={submitted}
            openId={openId}
            onOpenIdChange={setOpenId}
            onChange={setProducts}
          />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-end border-t border-line bg-card px-4 py-3 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16">
        <Button
          type="submit"
          className="w-auto px-6"
          data-e2e="expenses-management:recurring-save"
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
          Dodaj wydatek cykliczny
        </Button>
      </div>
    </form>
  );
};
