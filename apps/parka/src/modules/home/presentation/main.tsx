import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { ErrorState } from '@/shared/ui';
import { Main as Walkthrough } from '@/shared/walkthrough';
import { navigateTo, APP_ROUTER } from '@/shared/router';
import {
  ERROR_CODES,
  PERSISTENCE_KEY,
  STEPS,
} from '../configuration/constraints';

const enterApp = () => {
  // Personal finance features need a real account; onboarding hands off to
  // registration where the backend session (and demo data) is created.
  navigateTo(APP_ROUTER.signUp());
};

const HomeView = () => (
  <div
    data-e2e="home:main"
    className="mx-auto flex flex-1 w-full max-w-7xl flex-col justify-between px-6 py-12 md:px-8 lg:px-10 lg:py-16 xl:px-16"
  >
    <Walkthrough
      steps={STEPS}
      persistenceKey={PERSISTENCE_KEY}
      onFinish={enterApp}
      lastStepFooter={
        <p className="text-center text-sm text-ink-soft">
          Masz już konto?{' '}
          <a
            href={APP_ROUTER.signIn()}
            className="font-semibold text-brand-dark underline"
          >
            Zaloguj się
          </a>
        </p>
      }
    />
  </div>
);

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd ekranu powitalnego"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić ekranu powitalnego. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.home()}
      />
    )}
  >
    <HomeView />
  </ErrorBoundary>
);
