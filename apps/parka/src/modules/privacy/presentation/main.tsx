import { Download } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { ErrorState } from '@/shared/ui/error-state';
import { ERROR_CODES, POINTS } from '../configuration/constraints';

const PrivacyView = () => (
  <div data-e2e="privacy:main" className="relative flex flex-1 flex-col">
    <div className="md:px-4 lg:px-6 xl:px-12">
      <ScreenHeader
        title="RODO / Prywatność"
        backHref={APP_ROUTER.settings()}
      />
    </div>
    <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:grid lg:grid-cols-3 lg:content-start lg:items-start lg:px-10 xl:px-16">
      <Card as="section" className="space-y-3 lg:col-span-2 lg:row-span-2">
        <h2 className="text-sm font-semibold">Twoje dane</h2>
        <ul className="space-y-3" data-e2e="privacy:points">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" className="space-y-2 lg:col-start-3">
        <h2 className="text-sm font-semibold">Polityka prywatności</h2>
        <p className="text-sm text-ink-soft">
          Opisuje, jakie dane przetwarzamy, w jakim celu i jak długo.
          Przetwarzanie odbywa się wyłącznie po wyrażeniu zgody na pliki cookie.
        </p>
        <a
          href={APP_ROUTER.privacyPolicy()}
          className="text-sm font-semibold text-brand-dark underline"
        >
          Otwórz politykę prywatności
        </a>
      </Card>

      <div className="space-y-2 lg:col-start-3">
        <Button href={APP_ROUTER.dataExport()} data-e2e="privacy:manage-data">
          <Download className="h-4 w-4" aria-hidden="true" /> Zarządzaj danymi
        </Button>
      </div>
    </main>
  </div>
);

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku prywatności"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić strony. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <PrivacyView />
  </ErrorBoundary>
);
