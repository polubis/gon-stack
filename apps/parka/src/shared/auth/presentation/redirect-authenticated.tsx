import { navigateTo } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { AuthGuard } from './auth-guard';
import { AuthProvider } from './context';

/** Mount with `client:only`: Supabase browser client must not load at build. */
export const RedirectAuthenticated = () => (
  <AuthProvider>
    <AuthGuard
      redirect={{ authenticated: () => navigateTo(APP_ROUTER.dashboard()) }}
    />
  </AuthProvider>
);
