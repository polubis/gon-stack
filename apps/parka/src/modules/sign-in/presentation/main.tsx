import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Leaf } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { AuthGuard } from '@/shared/auth/presentation/auth-guard';
import { AuthProvider } from '@/shared/auth/presentation/context';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { navigateTo } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES } from '../configuration/constraints';
import { Provider, useContext } from './context';
import { selectCredentials, selectErrorMessage } from './selectors';
import { SocialButtons } from './social-buttons';

const SignInView = () => {
  const ctx = useContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalidInput, setInvalidInput] = useState(false);
  const pending = ctx.usePending();
  const submitError = ctx.useError();
  const redirected = ctx.useRedirected();
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
      className="flex flex-1 w-full flex-col justify-center md:items-center md:bg-brand-softer md:px-8 md:py-16"
    >
      <div className="mx-auto w-full max-w-md px-6 py-12 md:rounded-3xl md:border md:border-line md:bg-card md:p-10 md:shadow-card lg:p-12">
        <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Leaf className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Witaj ponownie!
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Zaloguj się, aby kontynuować.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <Field label="E-mail">
            <input
              type="email"
              name="email"
              autoComplete="email"
              className={inputClass}
              value={email}
              data-e2e="auth:email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
            />
          </Field>
          <Field label="Hasło">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className={inputClass}
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

          <Button type="submit" data-e2e="auth:submit" disabled={pending}>
            {pending ? 'Chwila…' : 'Zaloguj się'}
          </Button>
        </form>

        <a
          href={APP_ROUTER.signIn()}
          className="mt-3 block text-center text-sm text-ink-soft underline"
        >
          Nie pamiętasz hasła?
        </a>

        <SocialButtons />

        <p className="mt-6 text-center text-sm text-ink-soft">
          Nie masz konta?{' '}
          <a
            href={APP_ROUTER.signUp()}
            className="font-semibold text-brand-dark underline"
          >
            Zarejestruj się
          </a>
        </p>
      </div>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku logowania"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić formularza. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.home()}
      />
    )}
  >
    <AuthProvider>
      <AuthGuard
        redirect={{ authenticated: () => navigateTo(APP_ROUTER.dashboard()) }}
      />
    </AuthProvider>
    <Provider>
      <SignInView />
    </Provider>
  </ErrorBoundary>
);
