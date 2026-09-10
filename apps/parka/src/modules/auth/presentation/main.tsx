import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { Button, Field, inputClass } from '@/modules/shared/ui';

type Mode = 'sign-in' | 'sign-up';

const COPY: Record<
  Mode,
  { title: string; cta: string; alt: string; altHref: string; altLabel: string }
> = {
  'sign-in': {
    title: 'Witaj ponownie!',
    cta: 'Zaloguj się',
    alt: 'Nie masz konta?',
    altHref: '/sign-up/',
    altLabel: 'Zarejestruj się',
  },
  'sign-up': {
    title: 'Załóż konto',
    cta: 'Utwórz konto',
    alt: 'Masz już konto?',
    altHref: '/sign-in/',
    altLabel: 'Zaloguj się',
  },
};

export const Main = ({ mode }: { mode: Mode }) => {
  const copy = COPY[mode];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Podaj poprawny e-mail i hasło (min. 6 znaków).');
      return;
    }

    setPending(true);
    setError('');
    try {
      const res = await fetch(
        mode === 'sign-in' ? '/api/auth/login/' : '/api/auth/register/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          redirect: 'manual',
        },
      );

      if (res.type === 'opaqueredirect' || res.ok) {
        window.location.href = '/dashboard/';
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(body?.message ?? 'Nie udało się. Spróbuj ponownie.');
    } catch {
      setError('Brak połączenia z serwerem. Spróbuj ponownie.');
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
      <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
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
            autoComplete={
              mode === 'sign-in' ? 'current-password' : 'new-password'
            }
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
          {pending ? 'Chwila…' : copy.cta}
        </Button>
      </form>

      {mode === 'sign-in' ? (
        <a
          href="/sign-in/"
          className="mt-3 block text-center text-sm text-ink-soft underline"
        >
          Nie pamiętasz hasła?
        </a>
      ) : null}

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
        {copy.alt}{' '}
        <a
          href={copy.altHref}
          className="font-semibold text-brand-dark underline"
        >
          {copy.altLabel}
        </a>
      </p>
    </div>
  );
};
