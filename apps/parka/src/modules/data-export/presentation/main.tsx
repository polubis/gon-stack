import { useEffect, useState } from 'react';
import { Check, FileDown, FileText } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { ERROR_CODES, FORMATS } from '../configuration/constraints';
import { toFile, toRows } from './selectors';
import type { Format } from '../domain/models';
import { Provider, useContext } from './context';
import { download } from './download';

const DataExportView = () => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const categories = ctx.useCategories();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [format, setFormat] = useState<Format>('csv');
  const [done, setDone] = useState(false);

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const exportNow = () => {
    download(toFile(format, toRows(expenses, categories)));
    setDone(true);
  };

  return (
    <div data-e2e="data-export:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Eksport danych" backHref={APP_ROUTER.privacy()} />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:px-10 xl:px-16">
        <p className="max-w-3xl text-sm text-ink-soft md:text-base">
          Pobierz swoje dane finansowe w formacie CSV lub PDF. Masz pełną
          kontrolę nad danymi i możesz je usunąć w każdej chwili.
        </p>

        {error ? (
          <ErrorState
            data-e2e="data-export:load-error"
            title="Nie udało się wczytać danych do eksportu"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.privacy()}
          />
        ) : null}

        <fieldset className="grid gap-2 md:max-w-2xl md:grid-cols-2 md:gap-4">
          <legend className="mb-2 text-sm font-semibold">Format</legend>
          {FORMATS.map((f) => (
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

        <Button
          data-e2e="data-export:run"
          className="md:max-w-xs"
          disabled={initializing || error !== null}
          onClick={exportNow}
        >
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
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku eksportu"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić strony. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.privacy()}
      />
    )}
  >
    <Provider>
      <DataExportView />
    </Provider>
  </ErrorBoundary>
);
