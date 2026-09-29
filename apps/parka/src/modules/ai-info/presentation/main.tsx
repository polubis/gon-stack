import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router';
import { Card, ErrorState, ScreenHeader } from '@/shared/ui';
import { ERROR_CODES, STEPS } from '../configuration/constraints';

const AiInfoView = () => (
  <div data-e2e="ai-info:main" className="relative flex flex-1 flex-col">
    <ScreenHeader title="AI — jak to działa" backHref={APP_ROUTER.settings()} />
    <main className="flex flex-1 flex-col gap-3 px-4 pb-6 pt-2">
      <p className="text-sm text-ink-soft">
        AI analizuje paragony i pomaga w kategoryzacji oraz wykrywaniu
        nieprawidłowości i nietypowych wydatków.
      </p>
      <ul className="space-y-2" data-e2e="ai-info:steps">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <Card as="li" key={title} className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-ink-soft">{body}</p>
            </div>
          </Card>
        ))}
      </ul>
    </main>
  </div>
);

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku AI"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić strony. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <AiInfoView />
  </ErrorBoundary>
);
