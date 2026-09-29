import { describe, expect, it } from 'vitest';
import { toSignInResult } from '../integration/mappers';

describe('sign in mappers', () => {
  it('keeps the server rejection message', () => {
    expect(
      toSignInResult({ code: 400, type: 'bad-request', message: 'Nope' }),
    ).toEqual({ status: 'rejected', message: 'Nope' });
  });

  it('falls back to a default message when none is given', () => {
    expect(toSignInResult({ code: 303, location: '/' })).toEqual({
      status: 'rejected',
      message: 'Sign-in failed. Try again.',
    });
  });
});
