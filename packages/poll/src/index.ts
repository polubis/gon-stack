export type PollDelay = number | ((attempt: number) => number);

export type PollStop = () => void;

export type PollOptions<T> = {
  maxAttempts: number;
  delayMs: PollDelay;
  until: (result: T) => boolean;
  stopEmitter?: (stop: PollStop) => void;
};

export class PollMaxAttemptsError extends Error {
  constructor(maxAttempts: number) {
    super(`poll: exceeded maxAttempts (${maxAttempts})`);
    this.name = 'PollMaxAttemptsError';
  }
}

const resolveDelay = (delayMs: PollDelay, attempt: number): number =>
  typeof delayMs === 'function' ? delayMs(attempt) : delayMs;

/** Resolves once `ms` elapses, or immediately if `stopSignal` settles first — lets an in-flight delay be cut short by `stopEmitter`. */
const wait = (ms: number, stopSignal: Promise<void>): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    void stopSignal.then(() => {
      clearTimeout(timer);
      resolve();
    });
  });

export const poll = async <T>(
  fn: () => T | Promise<T>,
  options: PollOptions<T>,
): Promise<T> => {
  const { maxAttempts, delayMs, until, stopEmitter } = options;

  let stopRequested = false;
  let signalStop: PollStop = () => {};
  const stopSignal = new Promise<void>((resolve) => {
    signalStop = resolve;
  });

  stopEmitter?.(() => {
    stopRequested = true;
    signalStop();
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();

    if (until(result) || stopRequested) {
      return result;
    }

    if (attempt < maxAttempts) {
      await wait(resolveDelay(delayMs, attempt), stopSignal);
    }
  }

  throw new PollMaxAttemptsError(maxAttempts);
};
