import type { AuthError } from '@supabase/supabase-js';
import {
  BadRequest,
  InternalServer,
  TooManyRequests,
  Unauthorized,
  type AllErrors,
} from '../core/error-handling';

const TOO_MANY_ATTEMPTS = 'Too many attempts. Try again in a few minutes';

const RATE_LIMITED = new Set([
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'over_sms_send_rate_limit',
]);

/**
 * Single place that knows Supabase auth error codes. The original error always
 * travels as `cause`; the client only gets the fixed message of the result.
 */
export const fromSupabaseError = (error: AuthError): AllErrors => {
  const code = error.code ?? '';

  if (error.status === 429 || RATE_LIMITED.has(code)) {
    return new TooManyRequests(error, TOO_MANY_ATTEMPTS);
  }

  switch (code) {
    case 'invalid_credentials':
      return new Unauthorized(error, 'Invalid email or password');
    case 'email_not_confirmed':
      return new Unauthorized(error, 'Confirm your email before signing in');
    // Same answer as for an unknown account: no account enumeration.
    case 'user_already_exists':
      return new BadRequest(error, 'Unable to sign up with these details');
    case 'weak_password':
      return new BadRequest(error, 'Password is too weak');
    case 'email_address_invalid':
      return new BadRequest(error, 'Enter a valid email address');
    default:
      return new InternalServer(error);
  }
};
