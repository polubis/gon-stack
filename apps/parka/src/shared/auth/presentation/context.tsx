import { context } from '@repo/react-kit/context';
import { useAuth } from './use-auth';

/** Runs the session check once per provider scope; consumers only read it. */
export const [AuthProvider, useAuthContext] = context('Auth', useAuth);
