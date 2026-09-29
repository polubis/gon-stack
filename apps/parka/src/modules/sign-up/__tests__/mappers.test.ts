import { describe, expect, it } from 'vitest';
import { toSignUpResult } from '../integration/mappers';

describe('sign up mappers', () => {
  it('waits for confirmation on a 200 response', () => {
    expect(toSignUpResult({ code: 200, ok: true })).toEqual({
      status: 'pending-confirmation',
    });
  });

  it('keeps the server rejection message', () => {
    expect(
      toSignUpResult({ code: 400, type: 'bad-request', message: 'Taken' }),
    ).toEqual({ status: 'rejected', message: 'Taken' });
  });

  it('falls back to a default message when none is given', () => {
    expect(toSignUpResult({ code: 303, location: '/' })).toEqual({
      status: 'rejected',
      message: 'Sign-up failed. Try again.',
    });
  });
});
