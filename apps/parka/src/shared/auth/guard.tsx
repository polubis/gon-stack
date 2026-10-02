import { useEffect } from 'react';
import { supabaseBrowser } from '@/shared/data-sources/supabase-browser';
import { APP_ROUTER, navigateTo } from '@/shared/router';

type AuthGuardProps = {
  /** `protected`: signed-in only. `guest`: signed-out only. */
  mode: 'protected' | 'guest';
};

/**
 * Client-side entry control for prerendered pages. Renders nothing; redirects
 * when the Supabase session does not match `mode`, now and on auth changes.
 */
export const AuthGuard = ({ mode }: AuthGuardProps) => {
  useEffect(() => {
    const enforce = (signedIn: boolean) => {
      switch (mode) {
        case 'protected':
          if (!signedIn) navigateTo(APP_ROUTER.signIn());
          return;
        case 'guest':
          if (signedIn) navigateTo(APP_ROUTER.dashboard());
          return;
        default: {
          const exhaustive: never = mode;
          return exhaustive;
        }
      }
    };

    supabaseBrowser.auth.getUser().then(({ data }) => enforce(!!data.user));
    const { data } = supabaseBrowser.auth.onAuthStateChange((_, data) =>
      enforce(!!data?.user),
    );

    return () => data.subscription.unsubscribe();
  }, [mode]);

  return null;
};
