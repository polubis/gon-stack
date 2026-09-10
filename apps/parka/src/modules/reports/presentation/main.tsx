import { FileText, Download } from 'lucide-react';
import { AppShell, Card, ScreenHeader, Button } from '@/modules/shared/ui';
import {
  useParkaState,
  expensesForMonth,
  monthTotal,
  monthLabel,
  dateLabel,
  money,
} from '@/modules/shared/data';

const downloadBlob = (name: string, type: string, content: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const Main = () => {
  const state = useParkaState();
  const month = state.selectedMonth;
  const expenses = expensesForMonth(state, month);
  const total = monthTotal(state, month);
  const categoryCount = new Set(expenses.map((e) => e.categoryId)).size;
  const recurringCount = state.recurring.filter((r) => r.active).length;

  const buildCsv = () => {
    const rows = [
      ['Data', 'Sklep', 'Kategoria', 'Kwota', 'Typ'],
      ...expenses.map((e) => [
        dateLabel(e.date),
        e.merchant,
        state.categories.find((c) => c.id === e.categoryId)?.name ?? '',
        e.amount.toFixed(2),
        e.isBill ? 'Rachunek' : 'Zakup',
      ]),
    ];
    return rows.map((r) => r.join(';')).join('\n');
  };

  const buildReport = () =>
    [
      `Parka — raport ${monthLabel(month)}`,
      `Łączne wydatki: ${money(total)}`,
      `Liczba kategorii: ${categoryCount}`,
      `Transakcje cykliczne: ${recurringCount}`,
      '',
      buildCsv(),
    ].join('\n');

  return (
    <AppShell e2e="reports:main" nav="more">
      <ScreenHeader title="Raport" backHref="/settings/" />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <p className="text-sm capitalize text-ink-soft">{monthLabel(month)}</p>

        <Card className="space-y-4">
          <div>
            <p className="text-sm text-ink-soft">Twój miesiąc w liczbach</p>
            <p
              className="text-3xl font-bold tracking-tight"
              data-e2e="reports:total"
            >
              {money(total)}
            </p>
            <p className="text-xs text-ink-soft">Łączne wydatki</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-softer p-3">
              <p className="text-2xl font-bold" data-e2e="reports:categories">
                {categoryCount}
              </p>
              <p className="text-xs text-ink-soft">Kategorie</p>
            </div>
            <div className="rounded-xl bg-brand-softer p-3">
              <p className="text-2xl font-bold" data-e2e="reports:recurring">
                {recurringCount}
              </p>
              <p className="text-xs text-ink-soft">Transakcje cykliczne</p>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Button
            data-e2e="reports:download-csv"
            onClick={() =>
              downloadBlob(
                `parka-raport-${month}.csv`,
                'text/csv;charset=utf-8',
                buildCsv(),
              )
            }
          >
            <FileText className="h-4 w-4" aria-hidden="true" /> Pobierz CSV
          </Button>
          <Button
            variant="ghost"
            data-e2e="reports:download-full"
            onClick={() =>
              downloadBlob(
                `parka-raport-${month}.txt`,
                'text/plain;charset=utf-8',
                buildReport(),
              )
            }
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Pobierz pełny
            raport
          </Button>
        </div>
      </main>
    </AppShell>
  );
};
