import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { Button, Field, inputClass } from '@/modules/shared/ui';
import { signIn } from '../integration/repository';

export const Main = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and password (min. 6 characters).');
      return;
    }

    setPending(true);
    setError('');
    try {
      const result = await signIn(email, password);
      switch (result.status) {
        case 'redirected':
          window.location.href = '/dashboard/';
          return;
        case 'rejected':
          setError(result.message);
          return;
        default: {
          const exhaustive: never = result;
          return exhaustive;
        }
      }
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      data-e2e="auth:main"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12"
    >
      <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Leaf className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Witaj ponownie!</h1>
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
          <p role="alert" className="text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" data-e2e="auth:submit" disabled={pending}>
          {pending ? 'Chwila…' : 'Zaloguj się'}
        </Button>
      </form>

      <a
        href="/sign-in/"
        className="mt-3 block text-center text-sm text-ink-soft underline"
      >
        Nie pamiętasz hasła?
      </a>

      <div className="mt-6 space-y-2">
        <Button
          variant="ghost"
          disabled
          aria-disabled="true"
          data-e2e="auth:google"
        >
          Zaloguj przez Google (wkrótce)
        </Button>
        <Button
          variant="ghost"
          disabled
          aria-disabled="true"
          data-e2e="auth:apple"
        >
          Zaloguj przez Apple (wkrótce)
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Nie masz konta?{' '}
        <a href="/sign-up/" className="font-semibold text-brand-dark underline">
          Zarejestruj się
        </a>
      </p>
    </div>
  );
};
