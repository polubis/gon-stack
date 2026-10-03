import { useState, type FormEvent } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, Field, Segmented, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { fromDateInput, toDateInput } from '../domain/format';
import { newExpenseId } from '../domain/ids';
import type { CategoryId, Month } from '../domain/models';
import { useContext } from './context';
import { DetailDialog, DialogActions } from './detail-dialog';
import { RecurringForm } from './recurring-form';

type Kind = 'normal' | 'recurring';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'normal', label: 'Normalny' },
  { value: 'recurring', label: 'Cykliczny' },
];

const ExpenseForm = ({
  month,
  onDone,
}: {
  month: Month;
  onDone: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(toDateInput(new Date().toISOString()));
  const [method, setMethod] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);

  const selected = categories.some((c) => c.id === categoryId)
    ? categoryId
    : categories[0]?.id;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    ctx.createExpense(
      {
        id: newExpenseId(),
        merchant: merchant.trim(),
        date: fromDateInput(date),
        amount,
        categoryId: selected,
        paymentMethod: method.trim(),
        isBill: false,
        source: 'manual',
        items: [],
      },
      month,
    );
    onDone();
  };

  return (
    <form
      onSubmit={save}
      className="space-y-3"
      data-e2e="dashboard:new-expense-form"
    >
      <Field label="Sklep">
        <input
          className={inputClass}
          required
          value={merchant}
          placeholder="np. Biedronka"
          data-e2e="dashboard:new-merchant"
          onChange={(e) => setMerchant(e.target.value)}
        />
      </Field>
      <Field label="Kwota">
        <NumberInput
          required
          value={amount}
          data-e2e="dashboard:new-amount"
          onValueChange={setAmount}
        />
      </Field>
      <Field label="Data">
        <input
          type="date"
          className={inputClass}
          required
          value={date}
          data-e2e="dashboard:new-date"
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="Kategoria">
        <select
          className={inputClass}
          required
          value={selected ?? ''}
          data-e2e="dashboard:new-category"
          onChange={(e) => setCategoryId(e.target.value as CategoryId)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c.name)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Metoda płatności">
        <input
          className={inputClass}
          value={method}
          placeholder="np. Karta"
          data-e2e="dashboard:new-method"
          onChange={(e) => setMethod(e.target.value)}
        />
      </Field>
      <DialogActions>
        <Button variant="ghost" className="w-auto" onClick={onDone}>
          Anuluj
        </Button>
        <Button
          type="submit"
          className="w-auto"
          data-e2e="dashboard:new-save"
          disabled={!selected}
        >
          Dodaj
        </Button>
      </DialogActions>
    </form>
  );
};

/** One "add expense" popup; the switch on top picks a normal or recurring one. */
export const NewExpense = ({
  month,
  onClose,
}: {
  month: Month;
  onClose: () => void;
}) => {
  const [kind, setKind] = useState<Kind>('normal');

  return (
    <DetailDialog
      data-e2e="dashboard:new-dialog"
      title="Nowy wydatek"
      description={
        kind === 'recurring'
          ? 'Naliczany co miesiąc do wydatków i limitów'
          : 'Jednorazowy wydatek'
      }
      onClose={onClose}
    >
      <div className="mb-3">
        <Segmented<Kind>
          label="Rodzaj wydatku"
          options={KINDS}
          value={kind}
          onChange={setKind}
        />
      </div>
      {kind === 'normal' ? (
        <ExpenseForm month={month} onDone={onClose} />
      ) : (
        <RecurringForm month={month} onDone={onClose} />
      )}
    </DetailDialog>
  );
};
