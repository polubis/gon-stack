import type { ComponentType, ReactNode } from 'react';
import { useAuthContext } from './context';
import { useMinDelay } from './use-min-delay';
import { CheckingScreen } from './checking-screen';

type WithAuthOptions = {
  /** Rendered when signed out. Never redirects by itself; the fallback may. */
  fallback: ReactNode;
  /** Minimum time the checking screen stays visible. */
  minCheckMs?: number;
};

const CHECK_MS = 1000;

/**
 * HOC: shows a centered checking screen for at least `minCheckMs`, then the
 * wrapped component when signed in, otherwise `fallback`.
 */
export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  { fallback, minCheckMs = CHECK_MS }: WithAuthOptions,
) => {
  const Guarded = (props: P) => {
    const auth = useAuthContext();
    const elapsed = useMinDelay(minCheckMs);

    if (auth.status === 'checking' || !elapsed) return <CheckingScreen />;

    switch (auth.status) {
      case 'authenticated':
        return <Component {...props} />;
      case 'unauthenticated':
        return fallback;
      default: {
        const exhaustive: never = auth;
        return exhaustive;
      }
    }
  };

  Guarded.displayName = `withAuth(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Guarded;
};
