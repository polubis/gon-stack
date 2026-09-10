import { useMemo, useState } from 'react';
import { Camera, Check, ChevronDown, Plus, Sparkles } from 'lucide-react';
import {
  AppShell,
  Card,
  ScreenHeader,
  Button,
  Field,
  inputClass,
} from '@/modules/shared/ui';
import { CategoryAvatar } from '@/modules/shared/ui';
import {
  useParkaState,
  setState,
  whenSynced,
  genId,
  itemTotal,
  money,
  type ReceiptItem,
} from '@/modules/shared/data';

type Draft = {
  merchant: string;
  date: string;
  items: ReceiptItem[];
};

/** Simulated AI extraction — deterministic sample so review always has data. */
const extract = (): Draft => ({
  merchant: 'Biedronka',
  date: '2025-04-12',
  items: [
    {
      id: genId('ri'),
      name: 'Chleb pszenny',
      unitPrice: 1.99,
      quantity: 1,
      discount: 0,
      categoryId: 'groceries',
    },
    {
      id: genId('ri'),
      name: 'Mleko 2% 1 l',
      unitPrice: 2.99,
      quantity: 2,
      discount: 0,
      categoryId: 'groceries',
    },
    {
      id: genId('ri'),
      name: 'Ser twarogowy',
      unitPrice: 4.49,
      quantity: 1,
      discount: 0.5,
      categoryId: 'groceries',
    },
    {
      id: genId('ri'),
      name: 'Bilet MPK',
      unitPrice: 4.9,
      quantity: 1,
      discount: 0,
      categoryId: 'transport',
    },
  ],
});

export const Main = () => {
  const state = useParkaState();
  const [step, setStep] = useState<'scan' | 'processing' | 'review'>('scan');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const total = useMemo(
    () => (draft ? draft.items.reduce((s, i) => s + itemTotal(i), 0) : 0),
    [draft],
  );

  const capture = () => {
    setStep('processing');
    window.setTimeout(() => {
      setDraft(extract());
      setStep('review');
    }, 600);
  };

  const patchItem = (id: string, patch: Partial<ReceiptItem>) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          }
        : d,
    );

  const persist = async () => {
    if (!draft) return;
    const primary = draft.items[0]?.categoryId ?? 'other';
    setState((p) => ({
      ...p,
      expenses: [
        {
          id: genId('exp'),
          merchant: draft.merchant,
          date: `${draft.date}T12:00:00`,
          amount: Number(total.toFixed(2)),
          categoryId: primary,
          paymentMethod: 'Karta **** 4213',
          isBill: false,
          source: 'receipt',
          items: draft.items,
        },
        ...p.expenses,
      ],
      notifications: [
        {
          id: genId('ntf'),
          kind: 'receipt-confirmation',
          title: 'Nowy paragon',
          body: `${draft.merchant} · ${money(Number(total.toFixed(2)))}`,
          ageDays: 0,
        },
        ...p.notifications,
      ],
    }));
    await whenSynced();
    window.location.href = '/expenses/';
  };

  if (step !== 'review') {
    return (
      <AppShell e2e="receipt:main">
        <ScreenHeader title="Zrób zdjęcie paragonu" backHref="/dashboard/" />
        <main className="flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-4">
          <p className="text-center text-sm text-ink-soft">
            Automatyczne odczytywanie danych. Ustaw paragon w kadrze i zrób
            zdjęcie.
          </p>
          <div className="my-8 grid aspect-[3/4] w-full max-w-xs place-items-center rounded-3xl border-2 border-dashed border-brand/40 bg-brand-softer text-brand">
            {step === 'processing' ? (
              <span
                className="flex flex-col items-center gap-2 text-sm font-medium"
                role="status"
              >
                <Sparkles
                  className="h-8 w-8 animate-pulse"
                  aria-hidden="true"
                />
                Analizuję paragon…
              </span>
            ) : (
              <Camera className="h-12 w-12" aria-hidden="true" />
            )}
          </div>
          <Button
            data-e2e="receipt:capture"
            onClick={capture}
            disabled={step === 'processing'}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {step === 'processing' ? 'Przetwarzanie…' : 'Zrób zdjęcie'}
          </Button>
        </main>
      </AppShell>
    );
  }

  const d = draft as Draft;

  return (
    <AppShell e2e="receipt:main">
      <ScreenHeader title="Paragon — edycja danych" backHref="/dashboard/" />
      <main
        className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-2"
        data-e2e="receipt:review"
      >
        <Card className="space-y-3">
          <Field label="Sklep">
            <input
              className={inputClass}
              value={d.merchant}
              data-e2e="receipt:merchant"
              onChange={(e) => setDraft({ ...d, merchant: e.target.value })}
            />
          </Field>
          <Field label="Data zakupu">
            <input
              type="date"
              className={inputClass}
              value={d.date}
              data-e2e="receipt:date"
              onChange={(e) => setDraft({ ...d, date: e.target.value })}
            />
          </Field>
        </Card>

        <section aria-labelledby="items-heading" className="space-y-2">
          <div className="flex items-center justify-between">
            <h2
              id="items-heading"
              className="text-sm font-semibold text-ink-soft"
            >
              Produkty ({d.items.length})
            </h2>
            <button
              type="button"
              data-e2e="receipt:add-item"
              onClick={() =>
                setDraft({
                  ...d,
                  items: [
                    ...d.items,
                    {
                      id: genId('ri'),
                      name: 'Nowy produkt',
                      unitPrice: 0,
                      quantity: 1,
                      discount: 0,
                      categoryId: 'other',
                    },
                  ],
                })
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj produkt
            </button>
          </div>

          <ul className="space-y-2">
            {d.items.map((item) => {
              const category =
                state.categories.find((c) => c.id === item.categoryId) ??
                state.categories[0];
              const open = editingId === item.id;
              return (
                <Card as="li" key={item.id} className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(open ? null : item.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <CategoryAvatar category={category} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">
                        {item.name}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {category.name}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {money(itemTotal(item))}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {open ? (
                    <div className="grid grid-cols-2 gap-3 border-t border-black/5 pt-3">
                      <div className="col-span-2">
                        <Field label="Nazwa">
                          <input
                            className={inputClass}
                            value={item.name}
                            data-e2e="receipt:item-name"
                            onChange={(e) =>
                              patchItem(item.id, { name: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <Field label="Cena">
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          value={item.unitPrice}
                          data-e2e="receipt:item-price"
                          onChange={(e) =>
                            patchItem(item.id, {
                              unitPrice: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Ilość">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          className={inputClass}
                          value={item.quantity}
                          data-e2e="receipt:item-qty"
                          onChange={(e) =>
                            patchItem(item.id, {
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Rabat">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={inputClass}
                          value={item.discount}
                          data-e2e="receipt:item-discount"
                          onChange={(e) =>
                            patchItem(item.id, {
                              discount: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Kategoria">
                        <select
                          className={inputClass}
                          value={item.categoryId}
                          data-e2e="receipt:item-category"
                          onChange={(e) =>
                            patchItem(item.id, { categoryId: e.target.value })
                          }
                        >
                          {state.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </ul>
        </section>
      </main>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-black/5 bg-white px-4 py-3">
        <div className="flex-1">
          <p className="text-xs text-ink-soft">Razem</p>
          <p
            className="text-lg font-bold tabular-nums"
            data-e2e="receipt:total"
          >
            {money(Number(total.toFixed(2)))}
          </p>
        </div>
        <Button
          className="w-auto px-6"
          data-e2e="receipt:save"
          onClick={persist}
        >
          <Check className="h-4 w-4" aria-hidden="true" /> Zapisz
        </Button>
      </div>
    </AppShell>
  );
};
