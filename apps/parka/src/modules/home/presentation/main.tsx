import { Leaf } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { Button } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES, HIGHLIGHTS } from '../configuration/constraints';

const HomeView = () => (
  <div
    data-e2e="home:main"
    className="mx-auto flex w-full max-w-7xl flex-1 animate-view-enter flex-col justify-between px-6 py-12 motion-reduce:animate-none md:px-8 lg:px-10 lg:py-16 xl:px-16"
  >
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="mb-8 grid h-20 w-20 place-items-center rounded-3xl bg-brand-soft text-brand lg:mb-10 lg:h-28 lg:w-28">
        <Leaf className="h-10 w-10 lg:h-14 lg:w-14" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
        Parka
      </h1>
      <p className="mt-3 max-w-xs text-ink-soft md:max-w-md md:text-lg lg:mt-4 lg:max-w-xl lg:text-xl">
        Twoje wydatki pod kontrolą. Prosto, przejrzyście, bez stresu.
      </p>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-3 py-1.5 text-sm text-ink-soft"
          >
            <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
    <div className="mt-10 w-full space-y-3 md:mx-auto md:max-w-sm">
      <Button data-e2e="home:primary" href={APP_ROUTER.signUp()}>
        Załóż konto
      </Button>
      <p className="text-center text-sm text-ink-soft">
        Masz już konto?{' '}
        <a
          href={APP_ROUTER.signIn()}
          className="font-semibold text-brand-dark underline"
        >
          Zaloguj się
        </a>
      </p>
    </div>
  </div>
);

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd ekranu powitalnego"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.home()}
      />
    )}
  >
    <HomeView />
  </ErrorBoundary>
);
