import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Camera, PencilLine, Upload } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, Field, Segmented, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { RECEIPT_FILE_ERRORS } from '../configuration/constraints';
import { fromDateInput, toDateInput } from '../domain/format';
import { newExpenseId, newReceiptItemId } from '../domain/ids';
import { receiptFileProblem } from '../domain/receipt-file';
import type { CategoryId, Month, ReceiptDraft } from '../domain/models';
import { useContext } from './context';
import { DetailDialog, DialogActions } from './detail-dialog';
import { ReceiptCropper } from './receipt-cropper';
import { ReceiptScanError } from './receipt-scan-error';
import { ReceiptScanning } from './receipt-scanning';
import { RecurringForm } from './recurring-form';

type Kind = 'normal' | 'recurring';

type Step =
  | { type: 'form'; draft: ReceiptDraft | null }
  | { type: 'crop'; file: File }
  | { type: 'scanning' }
  | { type: 'error'; description: string; retry: () => void };

const KINDS: { value: Kind; label: string }[] = [
  { value: 'normal', label: 'Normalny' },
  { value: 'recurring', label: 'Cykliczny' },
];

const ExpenseForm = ({
  month,
  draft,
  onDone,
}: {
  month: Month;
  draft: ReceiptDraft | null;
  onDone: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const [merchant, setMerchant] = useState(draft?.merchant ?? '');
  const [amount, setAmount] = useState(draft?.amount ?? 0);
  const [date, setDate] = useState(
    toDateInput(draft?.date ?? new Date().toISOString()),
  );
  const [method, setMethod] = useState(draft?.paymentMethod ?? '');
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
        source: draft ? 'receipt' : 'manual',
        items: (draft?.items ?? []).map((item) => ({
          ...item,
          id: newReceiptItemId(),
          categoryId: selected,
        })),
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

const OptionButton = ({
  icon,
  label,
  pressed,
  disabled,
  onClick,
  'data-e2e': dataE2e,
}: {
  icon: ReactNode;
  label: string;
  pressed?: boolean;
  disabled: boolean;
  onClick: () => void;
  'data-e2e':
    'dashboard:new-upload' | 'dashboard:new-camera' | 'dashboard:new-manual';
}) => (
  <button
    type="button"
    aria-pressed={pressed}
    disabled={disabled}
    data-e2e={dataE2e}
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition-colors disabled:opacity-50',
      pressed
        ? 'border-brand bg-brand-softer text-brand-dark'
        : 'border-line-strong bg-card text-ink hover:bg-brand-softer',
    )}
  >
    {icon}
    {label}
  </button>
);

/** One "add expense" popup: pick how to add, then fill in the expense. */
export const NewExpense = ({
  month,
  onClose,
}: {
  month: Month;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const [kind, setKind] = useState<Kind>('normal');
  const [step, setStep] = useState<Step>({ type: 'form', draft: null });
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const request = useRef(0);

  const scanning = step.type === 'scanning';
  const manual = step.type === 'form' && step.draft === null;
  const showForm = step.type === 'form';

  const showManual = () => {
    request.current += 1;
    setStep({ type: 'form', draft: null });
  };

  const scan = (file: File) => {
    const current = ++request.current;
    setStep({ type: 'scanning' });
    ctx
      .scanReceipt(file)
      .then((draft) => {
        if (current === request.current) setStep({ type: 'form', draft });
      })
      .catch(() => {
        if (current !== request.current) return;
        setStep({
          type: 'error',
          description: RECEIPT_FILE_ERRORS.scan,
          retry: () => scan(file),
        });
      });
  };

  const pick = (input: RefObject<HTMLInputElement | null>) =>
    input.current?.click();

  const onPicked =
    (input: RefObject<HTMLInputElement | null>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const problem = receiptFileProblem(file);
      if (problem) {
        return setStep({
          type: 'error',
          description: problem,
          retry: () => pick(input),
        });
      }
      setStep({ type: 'crop', file });
    };

  return (
    <DetailDialog
      data-e2e="dashboard:new-dialog"
      title="Nowy wydatek"
      description={
        kind === 'recurring' && manual
          ? 'Naliczany co miesiąc do wydatków i limitów'
          : 'Wgraj lub sfotografuj paragon albo dodaj wydatek ręcznie'
      }
      onClose={onClose}
    >
      <div className="mb-3 grid grid-cols-3 gap-2">
        <OptionButton
          icon={<Upload className="h-5 w-5" aria-hidden="true" />}
          label="Wgraj z pliku"
          disabled={scanning}
          data-e2e="dashboard:new-upload"
          onClick={() => pick(uploadRef)}
        />
        <OptionButton
          icon={<Camera className="h-5 w-5" aria-hidden="true" />}
          label="Zrób zdjęcie"
          disabled={scanning}
          data-e2e="dashboard:new-camera"
          onClick={() => pick(cameraRef)}
        />
        <OptionButton
          icon={<PencilLine className="h-5 w-5" aria-hidden="true" />}
          label="Dodaj ręcznie"
          pressed={manual}
          disabled={scanning}
          data-e2e="dashboard:new-manual"
          onClick={showManual}
        />
      </div>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        hidden
        aria-label="Plik ze zdjęciem paragonu"
        data-e2e="dashboard:new-upload-input"
        onChange={(e) => onPicked(uploadRef)(e)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label="Zdjęcie paragonu z aparatu"
        data-e2e="dashboard:new-camera-input"
        onChange={(e) => onPicked(cameraRef)(e)}
      />

      {step.type === 'crop' ? (
        <ReceiptCropper
          file={step.file}
          onConfirm={scan}
          onCancel={showManual}
        />
      ) : null}
      {step.type === 'scanning' ? <ReceiptScanning /> : null}
      {step.type === 'error' ? (
        <ReceiptScanError
          description={step.description}
          onRetry={step.retry}
          onBack={showManual}
        />
      ) : null}
      {showForm ? (
        <>
          {step.draft === null ? (
            <div className="mb-3">
              <Segmented<Kind>
                label="Rodzaj wydatku"
                options={KINDS}
                value={kind}
                onChange={setKind}
              />
            </div>
          ) : null}
          {kind === 'normal' || step.draft !== null ? (
            <ExpenseForm
              key={step.draft ? 'scanned' : 'manual'}
              month={month}
              draft={step.draft}
              onDone={onClose}
            />
          ) : (
            <RecurringForm month={month} onDone={onClose} />
          )}
        </>
      ) : null}
    </DetailDialog>
  );
};
