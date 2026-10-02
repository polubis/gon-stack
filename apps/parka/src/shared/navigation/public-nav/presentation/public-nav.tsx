import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { supabaseBrowser } from '@/shared/data-sources/supabase-browser';
import { APP_ROUTER } from '@/shared/router/routes';

type Session = 'unknown' | 'signed-in' | 'signed-out';

const LINK =
  'whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold md:px-4 focus-visible:outline-2 focus-visible:outline-brand';

const useSession = (): Session => {
  const [session, setSession] = useState<Session>('unknown');

  useEffect(() => {
    const apply = (signedIn: boolean) =>
      setSession(signedIn ? 'signed-in' : 'signed-out');

    supabaseBrowser.auth.getUser().then(({ data }) => apply(!!data.user));
    const { data } = supabaseBrowser.auth.onAuthStateChange((_, next) =>
      apply(!!next?.user),
    );

    return () => data.subscription.unsubscribe();
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
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-8 lg:px-10 xl:px-16">
        <a
          href={APP_ROUTER.home()}
          data-e2e="public-nav:home"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand"
        >
          <Leaf className="h-5 w-5" aria-hidden="true" />
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
              className={cn(LINK, 'bg-brand text-on-brand')}
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
                    ? 'bg-brand-softer text-brand'
                    : 'text-ink-soft hover:bg-hover',
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
                  onSignUp
                    ? 'bg-brand-softer text-brand'
                    : 'bg-brand text-on-brand',
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
