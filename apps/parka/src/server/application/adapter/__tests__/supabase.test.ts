import { PostgrestError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import {
  BadRequest,
  Conflict,
  InternalServer,
  TooManyRequests,
  Unauthorized,
} from '../../core/error-handling';
import { fromSupabaseError } from '../supabase';

const postgresError = (code: string) =>
  new PostgrestError({ message: 'db failure', details: '', hint: '', code });

describe('Supabase adapter', () => {
  it('reports a still referenced row as a conflict', () => {
    expect(fromSupabaseError(postgresError('23503'))).toBeInstanceOf(Conflict);
  });

  it('hides unknown database failures behind an internal error', () => {
    expect(fromSupabaseError(postgresError('XX000'))).toBeInstanceOf(
      InternalServer,
    );
  });

  it.each(['PGRST301', 'PGRST303'])(
    'asks to sign in again when the token is rejected (%s)',
    (code) => {
      const error = fromSupabaseError(postgresError(code));

      expect(error).toBeInstanceOf(Unauthorized);
      expect(error.message).toBe('Session expired. Sign in again');
    },
  );

  it.each([
    'over_request_rate_limit',
    'over_email_send_rate_limit',
    'over_sms_send_rate_limit',
  ])('limits the rate for %s', (code) => {
    expect(fromSupabaseError({ message: 'slow', code })).toBeInstanceOf(
      TooManyRequests,
    );
  });

  it('limits the rate for a 429 status without a code', () => {
    expect(fromSupabaseError({ message: 'slow', status: 429 })).toBeInstanceOf(
      TooManyRequests,
    );
  });

  it.each([
    ['invalid_credentials', Unauthorized, 'Invalid email or password'],
    [
      'email_not_confirmed',
      Unauthorized,
      'Confirm your email before signing in',
    ],
    ['user_already_exists', BadRequest, 'Unable to sign up with these details'],
    ['weak_password', BadRequest, 'Password is too weak'],
    ['email_address_invalid', BadRequest, 'Enter a valid email address'],
  ])('maps auth code %s to a fixed message', (code, type, message) => {
    const error = fromSupabaseError({ message: 'raw detail', code });

    expect(error).toBeInstanceOf(type);
    expect(error.message).toBe(message);
  });

  it('keeps the original error as cause and out of the message', () => {
    const original = postgresError('XX000');
    const error = fromSupabaseError(original);

    expect(error).toHaveProperty('cause', original);
    expect(error.message).not.toContain('db failure');
  });

  it('treats an error without a code as internal', () => {
    expect(fromSupabaseError({ message: 'oops' })).toBeInstanceOf(
      InternalServer,
    );
  });
});
