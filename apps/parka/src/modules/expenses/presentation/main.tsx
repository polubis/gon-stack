import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import {
  AppShell,
  Card,
  Segmented,
  Button,
  Field,
  inputClass,
  CategoryAvatar,
} from '@/modules/shared/ui';
import {
  useParkaState,
  setState,
  itemTotal,
  monthOf,
  monthLabel,
  dateTimeLabel,
  money,
  type Expense,
} from '@/modules/shared/data';

type Filter = 'all' | 'category' | 'bills';

const groupByMonth = (list: Expense[]) => {
  const map = new Map<string, Expense[]>();
  for (const e of list) {
    const key = monthOf(e.date);
    map.set(key, [...(map.get(key) ?? []), e]);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
};

export const Main = () => {
  const state = useParkaState();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const selected = state.expenses.find((e) => e.id === selectedId) ?? null;

  const sorted = [...state.expenses].sort((a, b) => (a.date < b.date ? 1 : -1));
  const visible = filter === 'bills' ? sorted.filter((e) => e.isBill) : sorted;

  const row = (e: Expense) => {
    const category =
      state.categories.find((c) => c.id === e.categoryId) ??
      state.categories[0];
    return (
      <li key={e.id}>
        <button
          type="button"
          onClick={() => {
            setSelectedId(e.id);
            setEditing(false);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-black/[0.03]"
          data-e2e="expenses:row"
        >
          <CategoryAvatar category={category} />
          <span className="flex-1">
            <span className="block text-sm font-medium">{e.merchant}</span>
            <span className="block text-xs text-ink-soft">
              {dateTimeLabel(e.date)}
            </span>
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {money(e.amount)}
          </span>
        </button>
      </li>
    );
  };

  return (
    <AppShell e2e="expenses:main" nav="expenses" title="Wydatki">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <Segmented<Filter>
          label="Filtruj wydatki"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Wszystkie' },
            { value: 'category', label: 'Kategorie' },
            { value: 'bills', label: 'Rachunki' },
          ]}
        />

        {filter === 'category' ? (
          <div className="space-y-4">
            {state.categories.map((category) => {
              const items = visible.filter((e) => e.categoryId === category.id);
              if (items.length === 0) return null;
              return (
                <section key={category.id} aria-label={category.name}>
                  <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <CategoryAvatar category={category} className="h-6 w-6" />
                    {category.name}
                    <span className="ml-auto text-ink-soft">
                      {money(items.reduce((s, e) => s + e.amount, 0))}
                    </span>
                  </h2>
                  <Card className="p-2">
                    <ul>{items.map(row)}</ul>
                  </Card>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {groupByMonth(visible).map(([m, items]) => (
              <section key={m} aria-label={monthLabel(m)}>
                <h2 className="mb-1 flex items-center justify-between text-sm font-semibold capitalize">
                  {monthLabel(m)}
                  <span className="text-ink-soft">
                    {money(items.reduce((s, e) => s + e.amount, 0))}
                  </span>
                </h2>
                <Card className="p-2">
                  <ul>{items.map(row)}</ul>
                </Card>
              </section>
            ))}
            {visible.length === 0 ? (
              <p className="text-sm text-ink-soft">Brak wydatków.</p>
            ) : null}
          </div>
        )}
      </main>

      {selected ? (
        <ExpenseDetail
          expense={selected}
          editing={editing}
          onEdit={() => setEditing(true)}
          onClose={() => {
            setSelectedId(null);
            setEditing(false);
          }}
        />
      ) : null}
    </AppShell>
  );
};

const ExpenseDetail = ({
  expense,
  editing,
  onEdit,
  onClose,
}: {
  expense: Expense;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
}) => {
  const state = useParkaState();
  const category =
    state.categories.find((c) => c.id === expense.categoryId) ??
    state.categories[0];
  const [merchant, setMerchant] = useState(expense.merchant);
  const [amount, setAmount] = useState(String(expense.amount));
  const [categoryId, setCategoryId] = useState(expense.categoryId);

  const save = () => {
    setState((p) => ({
      ...p,
      expenses: p.expenses.map((e) =>
        e.id === expense.id
          ? { ...e, merchant, amount: Number(amount) || 0, categoryId }
          : e,
      ),
    }));
    onClose();
  };

  const remove = () => {
    setState((p) => ({
      ...p,
      expenses: p.expenses.filter((e) => e.id !== expense.id),
    }));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 px-4 pb-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Szczegóły wydatku ${expense.merchant}`}
      data-e2e="expenses:detail"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <CategoryAvatar category={category} />
          <div className="flex-1">
            <p className="text-base font-semibold">{expense.merchant}</p>
            <p className="text-xs text-ink-soft">
              {dateTimeLabel(expense.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-full px-2 py-1 text-sm text-ink-soft hover:bg-black/5"
          >
            Zamknij
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Field label="Sklep">
              <input
                className={inputClass}
                value={merchant}
                data-e2e="expenses:edit-merchant"
                onChange={(e) => setMerchant(e.target.value)}
              />
            </Field>
            <Field label="Kwota">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={amount}
                data-e2e="expenses:edit-amount"
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Kategoria">
              <select
                className={inputClass}
                value={categoryId}
                data-e2e="expenses:edit-category"
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Button data-e2e="expenses:save" onClick={save}>
              Zapisz zmiany
            </Button>
          </div>
        ) : (
          <>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Kwota</dt>
                <dd className="font-semibold tabular-nums">
                  {money(expense.amount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Kategoria</dt>
                <dd>{category.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Metoda płatności</dt>
                <dd>{expense.paymentMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Typ</dt>
                <dd>{expense.isBill ? 'Rachunek' : 'Zakup'}</dd>
              </div>
            </dl>

            {expense.items.length > 0 ? (
              <div className="mt-3 border-t border-black/5 pt-3">
                <p className="mb-1 text-sm font-semibold">
                  Produkty ({expense.items.length})
                </p>
                <ul className="space-y-1 text-sm">
                  {expense.items.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span className="text-ink-soft">
                        {i.name}
                        {i.quantity > 1 ? ` ×${i.quantity}` : ''}
                      </span>
                      <span className="tabular-nums">
                        {money(itemTotal(i))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 flex gap-2">
              <Button variant="ghost" data-e2e="expenses:edit" onClick={onEdit}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edytuj
              </Button>
              <Button
                variant="danger"
                data-e2e="expenses:delete"
                onClick={remove}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
