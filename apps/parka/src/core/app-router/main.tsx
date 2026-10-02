import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

/** Client-only entry for every `/app/*` page. */
export const Main = () => <RouterProvider router={router} />;
