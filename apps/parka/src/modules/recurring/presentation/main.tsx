import { useState } from 'react';
import {
  AppShell,
  Card,
  Segmented,
  Toggle,
  CategoryAvatar,
} from '@/modules/shared/ui';
import {
  useParkaState,
  setState,
  dateLabel,
  money,
  type Recurring,
} from '@/modules/shared/data';

type Tab = 'active' | 'all';

export const Main = () => {
  const state = useParkaState();
  const [tab, setTab] = useState<Tab>('active');
  const [openId, setOpenId] = useState<string | null>(null);

  const list =
    tab === 'active'
      ? state.recurring.filter((r) => r.active)
      : state.recurring;

  const toggle = (id: string, active: boolean) =>
    setState((p) => ({
      ...p,
      recurring: p.recurring.map((r) => (r.id === id ? { ...r, active } : r)),
    }));

  return (
    <AppShell e2e="recurring:main" nav="more" title="Wydatki cykliczne">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <Segmented<Tab>
          label="Filtr wydatków cyklicznych"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: 'Aktywne' },
            { value: 'all', label: 'Wszystkie' },
          ]}
        />

        <ul className="space-y-2" data-e2e="recurring:list">
          {list.map((r) => {
            const category =
              state.categories.find((c) => c.id === r.categoryId) ??
              state.categories[0];
            const open = openId === r.id;
            return (
              <Card as="li" key={r.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <CategoryAvatar category={category} />
                  <button
                    type="button"
                    className="flex-1 text-left"
                    aria-expanded={open}
                    data-e2e="recurring:row"
                    onClick={() => setOpenId(open ? null : r.id)}
                  >
                    <span className="block text-sm font-medium">{r.name}</span>
                    <span className="block text-xs text-ink-soft">
                      Co miesiąc · {money(r.cost)} · następny{' '}
                      {dateLabel(r.nextPaymentDate)}
                    </span>
                  </button>
                  <Toggle
                    checked={r.active}
                    onChange={(v) => toggle(r.id, v)}
                    label={`Śledzenie: ${r.name}`}
                  />
                </div>

                {open ? <RecurringDetail recurring={r} /> : null}
              </Card>
            );
          })}
          {list.length === 0 ? (
            <li className="text-sm text-ink-soft">
              Brak wydatków cyklicznych.
            </li>
          ) : null}
        </ul>
      </main>
    </AppShell>
  );
};

const RecurringDetail = ({ recurring }: { recurring: Recurring }) => (
  <div className="border-t border-black/5 pt-3" data-e2e="recurring:detail">
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Metoda płatności</dt>
        <dd>{recurring.paymentMethod}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Koszt</dt>
        <dd className="tabular-nums">{money(recurring.cost)}</dd>
      </div>
    </dl>
    <p className="mb-1 mt-3 text-sm font-semibold">Historia płatności</p>
    <ul className="space-y-1 text-sm">
      {recurring.history.map((h) => (
        <li key={h.date} className="flex justify-between">
          <span className="text-ink-soft">{dateLabel(h.date)}</span>
          <span className="tabular-nums">{money(h.amount)}</span>
        </li>
      ))}
    </ul>
  </div>
);
