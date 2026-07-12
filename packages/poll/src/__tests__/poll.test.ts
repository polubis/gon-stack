import { describe, expect, it } from 'vitest';
import { poll, PollMaxAttemptsError } from '../index';

describe('poll', () => {
  it('resolves with the first result that satisfies `until`', async () => {
    let calls = 0;
    const result = await poll(
      () => {
        calls++;
        return calls;
      },
      { maxAttempts: 5, delayMs: 1, until: (r) => r === 3 },
    );

    expect(result).toBe(3);
    expect(calls).toBe(3);
  });

  it('passes the current attempt number to a `delayMs` function and skips the delay after the last call', async () => {
    const attempts: number[] = [];
    let calls = 0;

    await poll(
      () => {
        calls++;
        return calls;
      },
      {
        maxAttempts: 4,
        delayMs: (attempt) => {
          attempts.push(attempt);
          return 1;
        },
        until: (r) => r === 4,
      },
    );

    expect(attempts).toEqual([1, 2, 3]);
  });

  it('throws PollMaxAttemptsError once `maxAttempts` is exhausted', async () => {
    await expect(
      poll(() => 'nope', { maxAttempts: 3, delayMs: 1, until: () => false }),
    ).rejects.toThrow(PollMaxAttemptsError);
  });

  it('stops immediately if `stopEmitter` fires before the first attempt resolves', async () => {
    let calls = 0;
    const result = await poll(
      () => {
        calls++;
        return calls;
      },
      {
        maxAttempts: 10,
        delayMs: 1000,
        until: () => false,
        stopEmitter: (stop) => stop(),
      },
    );

    expect(result).toBe(1);
    expect(calls).toBe(1);
  });

  it('cuts a pending delay short, runs one final attempt, then stops', async () => {
    let calls = 0;
    let stop: () => void = () => {};

    const promise = poll(
      () => {
        calls++;
        return calls;
      },
      {
        maxAttempts: 100,
        delayMs: 1000,
        until: () => false,
        stopEmitter: (s) => {
          stop = s;
        },
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 10));
    stop();
    const result = await promise;

    expect(result).toBe(2);
    expect(calls).toBe(2);
  });
});
