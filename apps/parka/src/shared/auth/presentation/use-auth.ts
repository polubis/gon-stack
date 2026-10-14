import { useEffect, useRef, useState } from 'react';
import { onAuthChange } from '../integration/auth-channel';
import { reconcileDevice } from '../integration/device-cleanup';
import { fetchAuth } from '../integration/repository';
import type { Auth } from '../domain/models';

/**
 * Asks the server who is signed in: `checking`, `unauthenticated`, or
 * `authenticated` with the user's id, email, display name and avatar. Asks
 * again when another tab changes accounts or this tab regains focus. A
 * different user than the one shown reloads the page, dropping stale data.
 */
export const useAuth = (): Auth => {
  const [auth, setAuth] = useState<Auth>({ status: 'checking' });
  const shown = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const next = await fetchAuth();
      const id = next.status === 'authenticated' ? next.user.id : null;
      if (id) await reconcileDevice(id);
      if (!active) return;
      if (shown.current && id && shown.current !== id) {
        window.location.reload();
        return;
      }
      shown.current = id;
      setAuth((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      );
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };

    void refresh();
    const unsubscribe = onAuthChange(() => void refresh());
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return auth;
};
