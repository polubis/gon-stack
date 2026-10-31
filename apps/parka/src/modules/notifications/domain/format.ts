const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** `przed chwilą`, `5 min temu`, `3 godz. temu`, `1 dzień temu`, `n dni temu`. */
export const ageLabel = (createdAt: string, now: number): string => {
  const elapsed = Math.max(0, now - new Date(createdAt).getTime());
  if (elapsed < MINUTE_MS) return 'przed chwilą';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min temu`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)} godz. temu`;
  const days = Math.floor(elapsed / DAY_MS);
  return days === 1 ? '1 dzień temu' : `${days} dni temu`;
};

const TASK_FORMS = new Intl.PluralRules('pl');

/** `1 zadanie`, `2 zadania`, `5 zadań`. */
export const taskCount = (count: number): string => {
  const rule = TASK_FORMS.select(count);
  const form =
    rule === 'one' ? 'zadanie' : rule === 'many' ? 'zadań' : 'zadania';
  return `${count} ${form}`;
};

/** `Dziś: Raport, Bank · Niezrobione łącznie: 5`; total omitted on old rows. */
export const unfinishedSummary = (payload: {
  tasks: readonly { title: string }[];
  totalOpen?: number;
}): string =>
  payload.totalOpen === undefined
    ? `Do zrobienia: ${taskCount(payload.tasks.length)}`
    : `Dziś: ${payload.tasks.map((t) => t.title).join(', ')} · Niezrobione łącznie: ${payload.totalOpen}`;

const money = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

const day = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatMoney = (amount: number): string => money.format(amount);

/** Accepts an ISO instant or a plain `YYYY-MM-DD` day. */
export const formatDay = (value: string): string => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return day.format(date);
};
