import {
  categoryLabel,
  MIXED_CATEGORY_LABEL,
} from '@/shared/i18n/category-label';
import type { Category, Expense, ExportFile, Format } from '../domain/models';

const plDate = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const HEADER = ['Data', 'Sklep', 'Kategoria', 'Kwota', 'Metoda płatności'];

export const dateLabel = (iso: string): string => plDate.format(new Date(iso));

export const toRows = (
  expenses: Expense[],
  categories: Category[],
): string[][] => [
  HEADER,
  ...expenses.map((e) => [
    dateLabel(e.date),
    e.merchant,
    e.categoryId === null
      ? MIXED_CATEGORY_LABEL
      : categoryLabel(
          categories.find((c) => c.id === e.categoryId)?.name ?? '',
        ),
    e.amount.toFixed(2),
    e.paymentMethod,
  ]),
];

export const toFile = (format: Format, rows: string[][]): ExportFile => {
  switch (format) {
    case 'csv':
      return {
        name: 'parka-dane.csv',
        type: 'text/csv;charset=utf-8',
        content: rows.map((r) => r.join(';')).join('\n'),
      };
    case 'pdf':
      return {
        name: 'parka-dane.txt',
        type: 'text/plain;charset=utf-8',
        content: [
          'Parka — eksport danych (PDF placeholder)',
          '',
          ...rows.map((r) => r.join(' | ')),
        ].join('\n'),
      };
    default: {
      const unreachable: never = format;
      return unreachable;
    }
  }
};
