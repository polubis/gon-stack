import { useEffect, useEffectEvent } from 'react';
import { useAuthContext } from './context';

type AuthGuardProps = {
  /** Callbacks per resolved status; routing is the caller's concern. */
  redirect: {
    authenticated?: () => void;
    unauthenticated?: () => void;
  };
};

/**
 * Client-side entry control for prerendered pages. Renders nothing; calls the
 * matching `redirect` callback when the Supabase session resolves, now and on
 * auth changes.
 */
export const AuthGuard = ({ redirect }: AuthGuardProps) => {
  const auth = useAuthContext();
  const onAuthenticated = useEffectEvent(() => redirect.authenticated?.());
  const onUnauthenticated = useEffectEvent(() => redirect.unauthenticated?.());

  useEffect(() => {
    switch (auth.status) {
      case 'checking':
        return;
      case 'authenticated':
        onAuthenticated();
        return;
      case 'unauthenticated':
        onUnauthenticated();
        return;
      default: {
        const exhaustive: never = auth;
        return exhaustive;
      }
    }
  }, [auth]);

  return null;
};
