import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '@/shared/auth/presentation/context';
import { router } from './router';

/** Client-only entry for every `/app/*` page. Checks auth once for the app. */
export const Main = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
