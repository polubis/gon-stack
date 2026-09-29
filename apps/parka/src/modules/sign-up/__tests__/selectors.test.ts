import { describe, expect, it } from 'vitest';
import {
  selectCredentials,
  selectErrorMessage,
} from '../presentation/selectors';

describe('sign up selectors', () => {
  it('accepts an email with a password of at least 6 characters', () => {
    expect(selectCredentials('a@b.co', '123456')).toEqual({
      email: 'a@b.co',
      password: '123456',
    });
  });

  it('rejects a short password or an email without @', () => {
    expect(selectCredentials('a@b.co', '12345')).toBeNull();
    expect(selectCredentials('ab.co', '123456')).toBeNull();
  });

  it('prefers the validation message over the server error', () => {
    expect(selectErrorMessage(true, 'server')).toContain('valid email');
    expect(selectErrorMessage(false, 'server')).toBe('server');
    expect(selectErrorMessage(false, null)).toBeNull();
  });
});
