import { MIXED_CATEGORY_LABEL } from '@/shared/i18n/category-label';
import { formatDay, formatMoney } from './format';
import type {
  CategorySnapshot,
  DiffRow,
  DiffSegment,
  ExpenseSnapshot,
  Notification,
  RecurringSnapshot,
} from './models';

type Field = [label: string, value: string];

/** Shown for a field the user left empty, so the row never reads as blank. */
const NONE = '—';

const INTERVALS: Record<RecurringSnapshot['interval'], string> = {
  weekly: 'Co tydzień',
  monthly: 'Co miesiąc',
  yearly: 'Co rok',
};

const expenseFields = (e: ExpenseSnapshot): Field[] => [
  ['Sprzedawca', e.merchant],
  ['Kwota', formatMoney(e.amount)],
  ['Data', formatDay(e.date)],
  ['Kategoria', e.category ?? MIXED_CATEGORY_LABEL],
  ['Płatność', e.paymentMethod || NONE],
  ['Rachunek', e.isBill ? 'Tak' : 'Nie'],
];

const categoryFields = (c: CategorySnapshot): Field[] => [
  ['Nazwa', c.name],
  ['Ikona', c.icon],
  ['Kolor', c.color],
];

const recurringFields = (
  r: RecurringSnapshot,
  days: readonly string[],
): Field[] => [
  ['Nazwa', r.name],
  ['Kwota', formatMoney(r.cost)],
  ['Cykl', INTERVALS[r.interval]],
  ['Kategoria', r.category ?? MIXED_CATEGORY_LABEL],
  ['Płatność', r.paymentMethod || NONE],
  ['Naliczone dni', days.map(formatDay).join(', ')],
];

const added = (fields: Field[]): DiffRow[] =>
  fields.map(([label, after]) => ({ label, before: null, after }));

const removed = (fields: Field[]): DiffRow[] =>
  fields.map(([label, before]) => ({ label, before, after: null }));

/** Only the fields that differ; both lists share the same labels in the same order. */
const changed = (before: Field[], after: Field[]): DiffRow[] =>
  after.flatMap(([label, next], i) => {
    const previous = before[i]?.[1] ?? null;
    return previous === next ? [] : [{ label, before: previous, after: next }];
  });

/** What a notification changed, as labelled rows. Empty when there is nothing to show. */
export const diffRows = (notification: Notification): DiffRow[] => {
  switch (notification.kind) {
    case 'expense-created':
      return added(expenseFields(notification.payload.expense));
    case 'expense-updated':
      return changed(
        expenseFields(notification.payload.before),
        expenseFields(notification.payload.after),
      );
    case 'expense-deleted':
      return removed(expenseFields(notification.payload.expense));
    case 'category-created':
      return added(categoryFields(notification.payload.category));
    case 'category-updated':
      return changed(
        categoryFields(notification.payload.before),
        categoryFields(notification.payload.after),
      );
    case 'category-deleted':
      return removed(categoryFields(notification.payload.category));
    case 'recurring-accrued':
      return added(
        recurringFields(notification.payload.rule, notification.payload.days),
      );
    case 'limit-reached':
      return [
        {
          label: 'Wydane',
          before: null,
          after: formatMoney(notification.payload.spent),
        },
        {
          label: 'Limit',
          before: null,
          after: formatMoney(notification.payload.amount),
        },
        {
          label: 'Próg',
          before: null,
          after: `${notification.payload.alertAt}%`,
        },
      ];
    /** A summary with a link, not a change: nothing to diff. */
    case 'time-day-unfinished':
      return [];
    case 'other':
      return [];
    default: {
      const unreachable: never = notification;
      return unreachable;
    }
  }
};

/** Words and the whitespace between them, so a diff keeps the original spacing. */
const tokens = (text: string): string[] => text.match(/\s+|\S+/g) ?? [];

/** Word-level diff via longest common subsequence; adjacent same-kind tokens are merged. */
export const diffText = (before: string, after: string): DiffSegment[] => {
  const a = tokens(before);
  const b = tokens(after);
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lcs[i]![j] =
        a[i] === b[j]
          ? lcs[i + 1]![j + 1]! + 1
          : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  const segments: DiffSegment[] = [];
  const push = (kind: DiffSegment['kind'], text: string) => {
    const last = segments.at(-1);
    if (last?.kind === kind) last.text += text;
    else segments.push({ kind, text });
  };

  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      push('same', a[i]!);
      i += 1;
      j += 1;
    } else if (
      j >= b.length ||
      (i < a.length && lcs[i + 1]![j]! >= lcs[i]![j + 1]!)
    ) {
      push('removed', a[i]!);
      i += 1;
    } else {
      push('added', b[j]!);
      j += 1;
    }
  }
  return segments;
};
