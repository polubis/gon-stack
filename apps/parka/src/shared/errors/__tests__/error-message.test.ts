import { describe, expect, it } from 'vitest';
import { errorMessage } from '../error-message';

describe('errorMessage', () => {
  it('returns the message of a failure', () => {
    expect(errorMessage(new Error('Network down'))).toBe('Network down');
  });

  it('falls back when the failure has no message', () => {
    expect(errorMessage(new Error(''))).toBe('Unknown error');
  });

  it('falls back for values that are not failures', () => {
    expect(errorMessage('boom')).toBe('Unknown error');
    expect(errorMessage(null)).toBe('Unknown error');
    expect(errorMessage({ message: 'plain object' })).toBe('Unknown error');
  });
});
