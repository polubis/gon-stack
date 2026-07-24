import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/* =============================================================================
 * Internal Types
 * ============================================================================= */

type UseForm = <TValues extends Record<string, unknown>>(
  config: UseFormConfig<TValues>,
) => UseFormReturn<TValues>;

/* =============================================================================
 * Public Types
 * ============================================================================= */

/** Options accepted by `useForm`. */
export type UseFormConfig<TValues> = {
  /** Initial field values; `reset()` restores these. */
  initialValues: TValues;
  /** Invoked by `submit()` with the current `values`. */
  onSubmit: (values: TValues) => void | Promise<void>;
};

/** The current lifecycle state of a `useForm` submission. */
export type FormState =
  | { is: 'idle' }
  | { is: 'busy' }
  | { is: 'ok' }
  | { is: 'fail'; error: FormError };

/** The outcome of a single `submit()` invocation. */
export type SubmitResult = { is: 'ok' } | { is: 'fail'; error: FormError };

/** The value returned by `useForm`. */
export type UseFormReturn<TValues> = {
  /** Current field values. */
  values: TValues;
  /** Updates a single field. */
  set: <K extends keyof TValues>(field: K, value: TValues[K]) => void;
  /** Restores `initialValues` and resets `state` to `idle`. */
  reset: () => void;
  /** Runs `onSubmit` with the current `values`. */
  submit: () => Promise<SubmitResult>;
  /** The latest submission lifecycle state. */
  state: FormState;
};

/* =============================================================================
 * Error
 * ============================================================================= */

/**
 * Normalized error shape returned by `useForm`. Wraps any thrown value
 * (validation failure, non-Error throw, rejected promise, ...) behind a
 * single, consistent type.
 */
export class FormError extends Error {
  readonly cause: unknown;

  private constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'FormError';
    this.cause = cause;
  }

  /** Normalizes any thrown value into a `FormError`, passing existing ones through as-is. */
  static from = (error: unknown): FormError => {
    if (error instanceof FormError) {
      return error;
    }

    if (error instanceof Error) {
      return new FormError(error.message, error);
    }

    return new FormError('Unknown error', error);
  };
}

/* =============================================================================
 * Hook
 * ============================================================================= */

/**
 * Holds form field values and exposes a submission lifecycle as `state`.
 * Calling `submit()` runs `onSubmit` with the latest `values`; overlapping
 * submissions keep only the result of the most recently invoked one.
 * `reset()` restores the initial values captured on first mount.
 *
 * @param config Options; see {@link UseFormConfig}.
 */
export const useForm: UseForm = (config) => {
  type TValues = typeof config.initialValues;
  const { onSubmit } = config;

  const [initial] = useState(() => config.initialValues);
  const [values, setValues] = useState(initial);
  const [state, setState] = useState<FormState>({ is: 'idle' });
  const valuesRef = useRef(values);
  const submitGeneration = useRef(0);

  useLayoutEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const set = useCallback(
    <K extends keyof TValues>(field: K, value: TValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initial);
    setState({ is: 'idle' });
  }, [initial]);

  const submit = useCallback(async (): Promise<SubmitResult> => {
    const generation = ++submitGeneration.current;

    setState({ is: 'busy' });

    const result = await Promise.resolve(onSubmit(valuesRef.current)).then(
      (): SubmitResult => ({ is: 'ok' }),
      (error): SubmitResult => ({ is: 'fail', error: FormError.from(error) }),
    );

    if (submitGeneration.current === generation) {
      setState(result);
    }

    return result;
  }, [onSubmit]);

  return { values, set, reset, submit, state };
};
