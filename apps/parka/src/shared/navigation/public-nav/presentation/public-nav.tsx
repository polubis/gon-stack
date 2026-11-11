import { useEffect, useState } from 'react';
import { cn } from '@repo/react-kit/cn';
import { onAuthChange } from '@/shared/auth/integration/auth-channel';
import { fetchAuth } from '@/shared/auth/integration/repository';
import { APP_ROUTER } from '@/shared/router/routes';
import { BrandMark } from '@/shared/ui/brand-mark';

type Session = 'unknown' | 'signed-in' | 'signed-out';

const LINK =
  'pressable whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-semibold min-[22.5rem]:px-3.5 md:px-5 focus-visible:outline-2 focus-visible:outline-brand';

const useSession = (): Session => {
  const [session, setSession] = useState<Session>('unknown');

  useEffect(() => {
    let active = true;
    const apply = () =>
      fetchAuth().then(({ status }) => {
        if (active)
          setSession(status === 'authenticated' ? 'signed-in' : 'signed-out');
      });

    void apply();
    const unsubscribe = onAuthChange(() => void apply());

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return session;
};

/** Top header for public pages: brand, sign-in / sign-up switch, app entry. */
export const PublicNav = () => {
  const session = useSession();
  const path = window.location.pathname;
  const onSignIn = path === APP_ROUTER.signIn();
  const onSignUp = path === APP_ROUTER.signUp();

  return (
    <header data-e2e="public-nav:main">
      <div className="glass mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-2 rounded-full border border-glass-line p-1.5">
        <a
          href={APP_ROUTER.home()}
          data-e2e="public-nav:home"
          className="flex items-center gap-2.5 rounded-full pr-3 text-lg font-bold tracking-tight text-ink"
        >
          <BrandMark className="size-11 rounded-full" />
          <span className="sr-only min-[30rem]:not-sr-only">Parka</span>
        </a>
        <nav
          aria-label="Nawigacja publiczna"
          className="flex items-center gap-1"
        >
          {session === 'signed-in' && (
            <a
              href={APP_ROUTER.dashboard()}
              data-e2e="public-nav:app"
              className={cn(LINK, 'cta shadow-cta')}
            >
              Przejdź do aplikacji
            </a>
          )}
          {session === 'signed-out' && (
            <>
              <a
                href={APP_ROUTER.signIn()}
                data-e2e="public-nav:sign-in"
                aria-current={onSignIn ? 'page' : undefined}
                className={cn(
                  LINK,
                  onSignIn
                    ? 'bg-hover text-ink'
                    : 'text-ink-soft hover:bg-hover hover:text-ink',
                )}
              >
                Zaloguj się
              </a>
              <a
                href={APP_ROUTER.signUp()}
                data-e2e="public-nav:sign-up"
                aria-current={onSignUp ? 'page' : undefined}
                className={cn(
                  LINK,
                  onSignUp ? 'bg-hover text-ink' : 'cta shadow-cta',
                )}
              >
                Zarejestruj się
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
