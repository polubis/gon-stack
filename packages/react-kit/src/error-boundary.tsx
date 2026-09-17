import { Component, type ErrorInfo, type ReactNode } from 'react';

/* =============================================================================
 * Internal Types
 * ============================================================================= */

type ErrorBoundaryState = { error: Error | null };

const hasChanged = (prev: unknown[] = [], next: unknown[] = []): boolean =>
  prev.length !== next.length || prev.some((value, i) => value !== next[i]);

/* =============================================================================
 * Public Types
 * ============================================================================= */

/** Props passed to a function `fallback`. */
export type ErrorBoundaryFallbackProps = {
  error: Error;
  /** Clears the caught error and re-renders `children`. */
  reset: () => void;
};

/** Props accepted by `ErrorBoundary`. */
export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Rendered instead of `children` once an error is caught. */
  fallback: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  /** Invoked once per caught error, before `fallback` renders. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** When any value here changes after an error was caught, the boundary resets. */
  resetKeys?: unknown[];
};

/* =============================================================================
 * Boundary
 * ============================================================================= */

/**
 * Catches render/lifecycle errors thrown by `children` and renders `fallback`
 * instead of unmounting the whole tree. Does not catch errors from event
 * handlers, async code, or errors thrown by the boundary itself.
 *
 * `fallback` can be a node or a `({ error, reset }) => ReactNode` render prop;
 * `reset()` clears the error and retries rendering `children`. The boundary
 * also resets automatically whenever an item in `resetKeys` changes.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={({ error, reset }) => (
 *     <Alert onRetry={reset}>{error.message}</Alert>
 *   )}
 *   onError={(error) => reportError(error)}
 * >
 *   <Widget />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      hasChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;

    if (error === null) return this.props.children;

    const { fallback } = this.props;
    return typeof fallback === 'function'
      ? fallback({ error, reset: this.reset })
      : fallback;
  }
}
