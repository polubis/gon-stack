import { act, renderHook, waitFor } from '@testing-library/react';
import { useForm, FormError } from '../use-form.js';
import type { SubmitResult } from '../use-form.js';

type LoginValues = {
  email: string;
  password: string;
};

const INITIAL: LoginValues = { email: '', password: '' };

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('Form utility', () => {
  it('works when mounted, starting with the initial field values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit: async () => {},
      }),
    );

    expect(result.current.values).toEqual(INITIAL);
    expect(result.current.state).toEqual({ is: 'idle' });
  });

  it('works when a field is updated, reflecting the new value', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit: async () => {},
      }),
    );

    act(() => {
      result.current.set('email', 'user@example.com');
    });

    expect(result.current.values).toEqual({
      email: 'user@example.com',
      password: '',
    });
  });

  it('works when the form is reset, restoring the initial field values', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit: async () => {},
      }),
    );

    act(() => {
      result.current.set('email', 'user@example.com');
    });

    await act(async () => {
      await result.current.submit();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(INITIAL);
    expect(result.current.state).toEqual({ is: 'idle' });
  });

  it('works when submission succeeds, passing the current field values to the handler', async () => {
    const onSubmit = vi.fn(async () => {});

    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit,
      }),
    );

    act(() => {
      result.current.set('email', 'user@example.com');
      result.current.set('password', 'secret');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.current.state).toEqual({ is: 'ok' });
  });

  it('works while submission is in progress', async () => {
    const { promise, resolve } = deferred<void>();
    const onSubmit = vi.fn(async () => promise);

    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit,
      }),
    );

    act(() => {
      void result.current.submit();
    });

    expect(result.current.state).toEqual({ is: 'busy' });

    await act(async () => {
      resolve();
      await promise;
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({ is: 'ok' });
    });
  });

  it('works when submission fails, surfacing the error', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit: async () => {
          throw new Error('Invalid credentials');
        },
      }),
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.error).toBeInstanceOf(FormError);
      expect(result.current.state.error.message).toBe('Invalid credentials');
    }
  });

  it('works when submissions overlap, keeping only the latest outcome', async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    let calls = 0;
    const onSubmit = vi.fn(async () => {
      calls += 1;
      return calls === 1 ? first.promise : second.promise;
    });

    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit,
      }),
    );

    await act(async () => {
      const firstSubmit = result.current.submit();
      const secondSubmit = result.current.submit();

      second.resolve();
      await secondSubmit;

      first.reject(new Error('First failed'));
      await firstSubmit;
    });

    expect(result.current.state).toEqual({ is: 'ok' });
  });

  it('works when an earlier overlapping submission fails, keeping the latest successful outcome', async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    let calls = 0;
    const onSubmit = vi.fn(async () => {
      calls += 1;
      return calls === 1 ? first.promise : second.promise;
    });

    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit,
      }),
    );

    await act(async () => {
      const firstSubmit = result.current.submit();
      const secondSubmit = result.current.submit();

      second.resolve();
      await secondSubmit;

      first.reject(new Error('First failed'));
      await firstSubmit;
    });

    expect(result.current.state).toEqual({ is: 'ok' });
  });

  it('works when submission completes successfully', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: INITIAL,
        onSubmit: async () => {},
      }),
    );

    let submitResult!: SubmitResult;
    await act(async () => {
      submitResult = await result.current.submit();
    });

    expect(submitResult).toEqual({ is: 'ok' });
    expect(result.current.state).toEqual({ is: 'ok' });
  });
});

describe('Form error normalization', () => {
  it('works when given an Error, keeping its message', () => {
    const original = new Error('boom');
    const formError = FormError.from(original);

    expect(formError).toBeInstanceOf(FormError);
    expect(formError.message).toBe('boom');
    expect(formError.cause).toBe(original);
  });

  it('works when given an already-wrapped error, returning it unchanged', () => {
    const formError = FormError.from(new Error('boom'));

    expect(FormError.from(formError)).toBe(formError);
  });

  it('works when given a non-error value, using a generic message', () => {
    const formError = FormError.from('just a string');

    expect(formError.message).toBe('Unknown error');
    expect(formError.cause).toBe('just a string');
  });
});
