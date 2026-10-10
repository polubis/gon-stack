import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { ErrorState } from '@/shared/ui/error-state';
import { ERROR_CODES, STEPS } from '../configuration/constraints';

const AiInfoView = () => (
  <div data-e2e="ai-info:main" className="relative flex flex-1 flex-col">
    <div className="md:px-4 lg:px-6 xl:px-12">
      <ScreenHeader
        title="AI — jak to działa"
        backHref={APP_ROUTER.settings()}
      />
    </div>
    <main className="flex flex-1 flex-col gap-3 px-4 pb-6 pt-2 md:gap-4 md:px-8 lg:px-10 xl:px-16">
      <p className="max-w-3xl text-sm text-ink-soft md:text-base">
        AI analizuje paragony i pomaga w kategoryzacji oraz wykrywaniu
        nieprawidłowości i nietypowych wydatków.
      </p>
      <ul
        className="grid gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-4"
        data-e2e="ai-info:steps"
      >
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
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku AI"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <AiInfoView />
  </ErrorBoundary>
);
