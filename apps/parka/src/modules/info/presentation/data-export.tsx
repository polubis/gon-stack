import { useState } from 'react';
import { FileText, FileDown, Check } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { AppShell, Card, ScreenHeader, Button } from '@/modules/shared/ui';
import { useParkaState, dateLabel } from '@/modules/shared/data';

type Format = 'csv' | 'pdf';

const download = (name: string, type: string, content: string) => {
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

export const DataExportMain = () => {
  const state = useParkaState();
  const [format, setFormat] = useState<Format>('csv');
  const [done, setDone] = useState(false);

  const rows = [
    ['Data', 'Sklep', 'Kategoria', 'Kwota', 'Metoda płatności'],
    ...state.expenses.map((e) => [
      dateLabel(e.date),
      e.merchant,
      state.categories.find((c) => c.id === e.categoryId)?.name ?? '',
      e.amount.toFixed(2),
      e.paymentMethod,
    ]),
  ];

  const exportNow = () => {
    if (format === 'csv') {
      download(
        'parka-dane.csv',
        'text/csv;charset=utf-8',
        rows.map((r) => r.join(';')).join('\n'),
      );
    } else {
      download(
        'parka-dane.txt',
        'text/plain;charset=utf-8',
        [
          'Parka — eksport danych (PDF placeholder)',
          '',
          ...rows.map((r) => r.join(' | ')),
        ].join('\n'),
      );
    }
    setDone(true);
  };

  return (
    <AppShell e2e="data-export:main" nav="more">
      <ScreenHeader title="Eksport danych" backHref="/privacy/" />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <p className="text-sm text-ink-soft">
          Pobierz swoje dane finansowe w formacie CSV lub PDF. Masz pełną
          kontrolę nad danymi i możesz je usunąć w każdej chwili.
        </p>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Format</legend>
          {(['csv', 'pdf'] as Format[]).map((f) => (
            <Card
              as="label"
              key={f}
              className={cn(
                'flex cursor-pointer items-center gap-3',
                f === format && 'border-brand',
              )}
            >
              <input
                type="radio"
                name="format"
                value={f}
                checked={f === format}
                data-e2e="data-export:format"
                onChange={() => {
                  setFormat(f);
                  setDone(false);
                }}
              />
              {f === 'csv' ? (
                <FileText className="h-5 w-5 text-brand" aria-hidden="true" />
              ) : (
                <FileDown className="h-5 w-5 text-brand" aria-hidden="true" />
              )}
              <span className="text-sm font-medium uppercase">{f}</span>
            </Card>
          ))}
        </fieldset>

        <Button data-e2e="data-export:run" onClick={exportNow}>
          Eksportuj
        </Button>

        {done ? (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark"
            data-e2e="data-export:done"
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Plik został
            pobrany.
          </p>
        ) : null}
      </main>
    </AppShell>
  );
};
