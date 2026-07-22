import { APIError } from '../use-api.js';

describe('Api error normalization', () => {
  it('works when given a native error, preserving its message and cause', () => {
    const original = new Error('boom');
    const apiError = APIError.from(original);

    expect(apiError).toBeInstanceOf(APIError);
    expect(apiError.message).toBe('boom');
    expect(apiError.cause).toBe(original);
  });

  it('works when given an already-normalized error, returning the same instance', () => {
    const apiError = APIError.from(new Error('boom'));

    expect(APIError.from(apiError)).toBe(apiError);
  });

  it('works when given a non-error value, falling back to a generic message', () => {
    const apiError = APIError.from('just a string');

    expect(apiError.message).toBe('Unknown error');
    expect(apiError.cause).toBe('just a string');
  });

  it('works when given an aborted request error, reporting it as aborted', () => {
    const apiError = APIError.from(new DOMException('Aborted', 'AbortError'));

    expect(apiError.isAborted).toBe(true);
  });

  it('works when given a non-aborted error, reporting it as not aborted', () => {
    const apiError = APIError.from(new Error('boom'));

    expect(apiError.isAborted).toBe(false);
  });
});
