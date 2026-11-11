import { ClearableInput } from '@/shared/ui/clearable';
import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Button, Field } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { navigateTo } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES, MESSAGES } from '../configuration/constraints';
import { Provider, useContext } from './context';
import { selectCredentials, selectErrorMessage } from './selectors';
import { SocialButtons } from './social-buttons';

const SignUpView = () => {
  const ctx = useContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalidInput, setInvalidInput] = useState(false);
  const pending = ctx.usePending();
  const submitError = ctx.useError();
  const redirected = ctx.useRedirected();
  const awaitingConfirmation = ctx.useAwaitingConfirmation();
  const error = selectErrorMessage(invalidInput, submitError);

  useEffect(() => {
    if (redirected) navigateTo(APP_ROUTER.dashboard());
  }, [redirected]);

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const credentials = selectCredentials(email, password);
    setInvalidInput(credentials === null);
    if (credentials) ctx.submit(credentials);
  };

  return (
    <div
      data-e2e="auth:main"
      className="flex w-full flex-1 flex-col justify-center px-4 py-8 md:items-center md:px-8 md:py-16"
    >
      <div className="mx-auto w-full max-w-md animate-view-enter rounded-4xl border border-line bg-card p-6 shadow-popover motion-reduce:animate-none md:p-10 lg:p-12">
        <BrandMark className="mb-6 size-14" />
        <h1 className="text-4xl font-semibold leading-none tracking-tight">
          Załóż konto
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Zaloguj się, aby kontynuować.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <Field label="E-mail">
            <ClearableInput
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              data-e2e="auth:email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
            />
          </Field>
          <Field label="Hasło">
            <ClearableInput
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              data-e2e="auth:password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          {awaitingConfirmation ? (
            <p role="status" className="text-sm text-brand-dark">
              {MESSAGES.confirmation}
            </p>
          ) : null}

          <Button type="submit" data-e2e="auth:submit" disabled={pending}>
            {pending ? 'Chwila…' : 'Utwórz konto'}
          </Button>
        </form>

        <SocialButtons />

        <p className="mt-6 text-center text-sm text-ink-soft">
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
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku rejestracji"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.home()}
      />
    )}
  >
    <Provider>
      <SignUpView />
    </Provider>
  </ErrorBoundary>
);
