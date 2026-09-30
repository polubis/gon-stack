import { useState } from 'react';
import { Check, LoaderCircle, Plus } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router';
import { Button, Card, Field, ScreenHeader, inputClass } from '@/shared/ui';
import { DEFAULT_ITEM_NAME } from '../configuration/constraints';
import { money } from '../domain/format';
import type { Category, Draft, ReceiptItemId } from '../domain/models';
import { addItem, patchItem } from '../domain/receipt';
import { ItemCard } from './item-card';
import { canSave, defaultCategoryId, draftTotal } from './selectors';

type Props = {
  draft: Draft;
  categories: Category[];
  saving: boolean;
  onChange: (draft: Draft) => void;
  onSave: () => void;
};

export const ReviewStep = ({
  draft,
  categories,
  saving,
  onChange,
  onSave,
}: Props) => {
  const [editingId, setEditingId] = useState<ReceiptItemId | null>(null);

  return (
    <>
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader
          title="Paragon — edycja danych"
          backHref={APP_ROUTER.dashboard()}
        />
      </div>
      <main
        className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-2 md:gap-6 md:px-8 lg:grid lg:grid-cols-3 lg:content-start lg:items-start lg:px-10 lg:pb-8 xl:px-16"
        data-e2e="receipt:review"
      >
        {categories.length === 0 ? (
          <Card
            data-e2e="receipt:no-categories"
            role="status"
            className="lg:col-span-3"
          >
            <p className="text-sm text-ink-soft">
              Aby zapisać paragon, dodaj najpierw kategorię (np. sugerowane).
            </p>
            <a
              href={APP_ROUTER.categories()}
              className="text-sm font-medium underline"
            >
              Dodaj kategorię
            </a>
          </Card>
        ) : null}
        <Card className="space-y-3 lg:sticky lg:top-20">
          <Field label="Sklep">
            <input
              className={inputClass}
              value={draft.merchant}
              data-e2e="receipt:merchant"
              onChange={(e) => onChange({ ...draft, merchant: e.target.value })}
            />
          </Field>
          <Field label="Data zakupu">
            <input
              type="date"
              className={inputClass}
              value={draft.date}
              data-e2e="receipt:date"
              onChange={(e) => onChange({ ...draft, date: e.target.value })}
            />
          </Field>
        </Card>

        <section
          aria-labelledby="items-heading"
          className="space-y-2 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2
              id="items-heading"
              className="text-sm font-semibold text-ink-soft"
            >
              Produkty ({draft.items.length})
            </h2>
            <button
              type="button"
              data-e2e="receipt:add-item"
              onClick={() =>
                onChange(
                  addItem(
                    draft,
                    defaultCategoryId(categories),
                    DEFAULT_ITEM_NAME,
                  ),
                )
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj produkt
            </button>
          </div>

          <ul className="space-y-2 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            {draft.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                categories={categories}
                open={editingId === item.id}
                onToggle={() =>
                  setEditingId(editingId === item.id ? null : item.id)
                }
                onPatch={(patch) => onChange(patchItem(draft, item.id, patch))}
              />
            ))}
          </ul>
        </section>
      </main>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-card px-4 py-3 md:px-8 lg:px-10 xl:px-16">
        <div className="flex-1">
          <p className="text-xs text-ink-soft">Razem</p>
          <p
            className="text-lg font-bold tabular-nums"
            data-e2e="receipt:total"
          >
            {money(draftTotal(draft))}
          </p>
        </div>
        <Button
          className="w-auto px-6"
          data-e2e="receipt:save"
          disabled={saving || !canSave(draft, categories)}
          onClick={onSave}
        >
          {saving ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Check className="h-4 w-4" aria-hidden="true" />
          )}{' '}
          Zapisz
        </Button>
      </div>
    </>
  );
};
