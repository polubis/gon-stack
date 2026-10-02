import { useEffect, useState } from 'react';
import { fetchAuth, subscribeAuth } from '../integration/repository';
import type { Auth } from '../domain/models';

/**
 * Resolves the Supabase session into one object, either `checking`,
 * `unauthenticated`, or `authenticated` with the user's id, display name and
 * avatar. Failed checks resolve as `unauthenticated`. Keeps following auth
 * changes.
 */
export const useAuth = (): Auth => {
  const [auth, setAuth] = useState<Auth>({ status: 'checking' });

  useEffect(() => {
    let active = true;
    const resolve = (next: Auth) => {
      if (active) setAuth(next);
    };

    fetchAuth().then(resolve);
    const unsubscribe = subscribeAuth(resolve);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return auth;
};
