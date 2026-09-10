import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  AppShell,
  Card,
  Segmented,
  ProgressBar,
  Toggle,
  Button,
  Field,
  inputClass,
  CategoryAvatar,
} from '@/modules/shared/ui';
import {
  useParkaState,
  setState,
  genId,
  limitProgress,
  monthLabel,
  money,
} from '@/modules/shared/data';

type Tab = 'total' | 'category' | 'goals';

const tone = (pct: number) =>
  pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'brand';

export const Main = () => {
  const state = useParkaState();
  const month = state.selectedMonth;
  const [tab, setTab] = useState<Tab>('total');
  const [showLimitForm, setShowLimitForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const progress = limitProgress(state, month);

  return (
    <AppShell e2e="limits:main" nav="more" title="Limity i cele">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <Segmented<Tab>
          label="Widok limitów"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'total', label: 'Ogólne' },
            { value: 'category', label: 'Kategorie' },
            { value: 'goals', label: 'Cele' },
          ]}
        />

        {tab === 'total' ? (
          <TotalLimit progress={progress.total} month={month} />
        ) : tab === 'category' ? (
          <>
            <ul className="space-y-2" data-e2e="limits:category-list">
              {progress.categories.map((c) => {
                const category =
                  state.categories.find((x) => x.id === c.categoryId) ??
                  state.categories[0];
                return (
                  <Card as="li" key={c.categoryId} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CategoryAvatar category={category} />
                      <span className="flex-1 text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="text-sm tabular-nums">
                        {money(c.spent)} / {money(c.amount)}
                      </span>
                    </div>
                    <ProgressBar
                      pct={c.pct}
                      tone={tone(c.pct)}
                      label={`${category.name}: ${Math.round(c.pct)}% limitu`}
                    />
                    <p className="text-xs text-ink-soft">
                      {Math.round(c.pct)}% limitu
                      {c.alertAt80 ? ' · alert przy 80%' : ''}
                    </p>
                  </Card>
                );
              })}
            </ul>

            {showLimitForm ? (
              <NewLimitForm onDone={() => setShowLimitForm(false)} />
            ) : (
              <Button
                data-e2e="limits:new"
                onClick={() => setShowLimitForm(true)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Ustaw nowy limit
              </Button>
            )}
          </>
        ) : (
          <>
            <ul className="space-y-2" data-e2e="goals:list">
              {state.goals.map((g) => {
                const pct = (g.saved / g.target) * 100;
                return (
                  <Card as="li" key={g.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{g.name}</span>
                      <span className="text-sm tabular-nums">
                        {money(g.saved)} / {money(g.target)}
                      </span>
                    </div>
                    <ProgressBar
                      pct={pct}
                      label={`${g.name}: ${Math.round(pct)}%`}
                    />
                    <p className="text-xs text-ink-soft">
                      {Math.round(pct)}% · {g.months} mies.
                    </p>
                  </Card>
                );
              })}
            </ul>

            {showGoalForm ? (
              <NewGoalForm onDone={() => setShowGoalForm(false)} />
            ) : (
              <Button
                data-e2e="goals:new"
                onClick={() => setShowGoalForm(true)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj cel
              </Button>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
};

const TotalLimit = ({
  progress,
  month,
}: {
  progress: ReturnType<typeof limitProgress>['total'];
  month: string;
}) => {
  const state = useParkaState();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(progress?.amount ?? 3500));

  if (!progress)
    return <p className="text-sm text-ink-soft">Brak zdefiniowanego limitu.</p>;

  const save = () => {
    setState((p) => ({
      ...p,
      limits: p.limits.map((l) =>
        l.scope === 'total' ? { ...l, amount: Number(amount) || l.amount } : l,
      ),
    }));
    setEditing(false);
  };

  return (
    <Card className="space-y-3" data-e2e="limits:total">
      <div>
        <p className="text-sm text-ink-soft">
          Limit miesięczny · {monthLabel(month)}
        </p>
        <p className="text-2xl font-bold tabular-nums">
          {money(progress.amount)}
        </p>
      </div>
      <ProgressBar
        pct={progress.pct}
        tone={tone(progress.pct)}
        label={`Wykorzystano ${Math.round(progress.pct)}% limitu`}
      />
      <p className="text-sm tabular-nums text-ink-soft">
        {money(progress.spent)} · {Math.round(progress.pct)}%
      </p>

      {editing ? (
        <div className="space-y-2">
          <Field label="Nowy limit miesięczny">
            <input
              type="number"
              className={inputClass}
              value={amount}
              data-e2e="limits:total-amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Button data-e2e="limits:total-save" onClick={save}>
            Zapisz
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          data-e2e="limits:total-edit"
          onClick={() => setEditing(true)}
        >
          Zmień limit
        </Button>
      )}
      <p className="sr-only">{state.categories.length} kategorii</p>
    </Card>
  );
};

const NewLimitForm = ({ onDone }: { onDone: () => void }) => {
  const state = useParkaState();
  const withoutLimit = state.categories.filter(
    (c) => !state.limits.some((l) => l.categoryId === c.id),
  );
  const [categoryId, setCategoryId] = useState(
    withoutLimit[0]?.id ?? state.categories[0].id,
  );
  const [amount, setAmount] = useState('300');
  const [alertAt80, setAlertAt80] = useState(true);
  const [delivery, setDelivery] = useState<'push' | 'email'>('push');

  const save = () => {
    setState((p) => ({
      ...p,
      limits: [
        ...p.limits,
        {
          id: genId('limit'),
          scope: 'category',
          categoryId,
          amount: Number(amount) || 0,
          alertAt80,
          delivery,
        },
      ],
    }));
    onDone();
  };

  return (
    <Card className="space-y-3" data-e2e="limits:form">
      <h2 className="text-sm font-semibold">Nowy limit</h2>
      <Field label="Kategoria">
        <select
          className={inputClass}
          value={categoryId}
          data-e2e="limits:form-category"
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Limit miesięczny">
        <input
          type="number"
          className={inputClass}
          value={amount}
          data-e2e="limits:form-amount"
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <div className="flex items-center justify-between">
        <span className="text-sm">Ostrzeżenie przy 80%</span>
        <Toggle
          checked={alertAt80}
          onChange={setAlertAt80}
          label="Ostrzeżenie przy 80%"
        />
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-ink-soft">
          Powiadomienia
        </legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="delivery"
              checked={delivery === 'push'}
              onChange={() => setDelivery('push')}
            />
            Push
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="delivery"
              checked={delivery === 'email'}
              onChange={() => setDelivery('email')}
            />
            Email
          </label>
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button data-e2e="limits:form-save" onClick={save}>
          Zapisz
        </Button>
      </div>
    </Card>
  );
};

const NewGoalForm = ({ onDone }: { onDone: () => void }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('2000');
  const [months, setMonths] = useState('6');

  const save = () => {
    setState((p) => ({
      ...p,
      goals: [
        ...p.goals,
        {
          id: genId('goal'),
          name: name || 'Nowy cel',
          target: Number(target) || 0,
          saved: 0,
          months: Number(months) || 1,
        },
      ],
    }));
    onDone();
  };

  return (
    <Card className="space-y-3" data-e2e="goals:form">
      <h2 className="text-sm font-semibold">Nowy cel oszczędnościowy</h2>
      <Field label="Nazwa">
        <input
          className={inputClass}
          value={name}
          data-e2e="goals:form-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Wakacje"
        />
      </Field>
      <Field label="Kwota docelowa">
        <input
          type="number"
          className={inputClass}
          value={target}
          data-e2e="goals:form-target"
          onChange={(e) => setTarget(e.target.value)}
        />
      </Field>
      <Field label="Horyzont (miesiące)">
        <input
          type="number"
          className={inputClass}
          value={months}
          data-e2e="goals:form-months"
          onChange={(e) => setMonths(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button data-e2e="goals:form-save" onClick={save}>
          Zapisz
        </Button>
      </div>
    </Card>
  );
};
