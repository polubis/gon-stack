import { describe, expect, it, vi } from 'vitest';
import { poll, PollMaxAttemptsError } from '../index';

describe('poll', () => {
  describe('resolution', () => {
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

    it('resolves on the only attempt when `maxAttempts` is 1 and `until` passes immediately', async () => {
      let delayCalls = 0;
      const result = await poll(() => 42, {
        maxAttempts: 1,
        delayMs: () => {
          delayCalls++;
          return 1;
        },
        until: () => true,
      });

      expect(result).toBe(42);
      expect(delayCalls).toBe(0);
    });

    it('supports an async `fn` that returns a promise', async () => {
      let calls = 0;
      const result = await poll(
        async () => {
          calls++;
          await new Promise((resolve) => setTimeout(resolve, 1));
          return calls;
        },
        { maxAttempts: 5, delayMs: 1, until: (r) => r === 2 },
      );

      expect(result).toBe(2);
    });

    it('resolves non-primitive results returned by `fn`', async () => {
      type State = { status: 'pending' | 'done'; attempt: number };
      let attempt = 0;

      const result = await poll<State>(
        () => {
          attempt++;
          return { status: attempt === 2 ? 'done' : 'pending', attempt };
        },
        { maxAttempts: 5, delayMs: 1, until: (r) => r.status === 'done' },
      );

      expect(result).toEqual({ status: 'done', attempt: 2 });
    });
  });

  describe('delay', () => {
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

    it('waits for the resolved delay before running the next attempt', async () => {
      vi.useFakeTimers();

      try {
        let calls = 0;
        const promise = poll(
          () => {
            calls++;
            return calls;
          },
          { maxAttempts: 3, delayMs: 50, until: (r) => r === 2 },
        );

        await vi.advanceTimersByTimeAsync(0);
        expect(calls).toBe(1);

        await vi.advanceTimersByTimeAsync(49);
        expect(calls).toBe(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(calls).toBe(2);

        await expect(promise).resolves.toBe(2);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('failure', () => {
    it('throws PollMaxAttemptsError once `maxAttempts` is exhausted', async () => {
      await expect(
        poll(() => 'nope', { maxAttempts: 3, delayMs: 1, until: () => false }),
      ).rejects.toThrow(PollMaxAttemptsError);
    });

    it('throws immediately without calling `fn` when `maxAttempts` is 0', async () => {
      let calls = 0;

      await expect(
        poll(
          () => {
            calls++;
            return 1;
          },
          { maxAttempts: 0, delayMs: 1, until: () => true },
        ),
      ).rejects.toThrow(PollMaxAttemptsError);
      expect(calls).toBe(0);
    });

    it('throws after a single failed attempt when `maxAttempts` is 1, without delaying', async () => {
      let calls = 0;
      let delayCalls = 0;

      await expect(
        poll(
          () => {
            calls++;
            return calls;
          },
          {
            maxAttempts: 1,
            delayMs: () => {
              delayCalls++;
              return 1;
            },
            until: () => false,
          },
        ),
      ).rejects.toThrow(PollMaxAttemptsError);
      expect(calls).toBe(1);
      expect(delayCalls).toBe(0);
    });

    it('creates a PollMaxAttemptsError with a descriptive name and message', async () => {
      expect.assertions(4);

      await poll(() => 1, {
        maxAttempts: 2,
        delayMs: 1,
        until: () => false,
      }).catch((err: unknown) => {
        expect(err).toBeInstanceOf(PollMaxAttemptsError);
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).name).toBe('PollMaxAttemptsError');
        expect((err as Error).message).toContain('2');
      });
    });

    it('propagates a synchronous throw from `fn` without retrying', async () => {
      let calls = 0;

      await expect(
        poll(
          () => {
            calls++;
            throw new Error('sync boom');
          },
          { maxAttempts: 5, delayMs: 1, until: () => false },
        ),
      ).rejects.toThrow('sync boom');
      expect(calls).toBe(1);
    });

    it('propagates a rejected `fn` without retrying', async () => {
      let calls = 0;

      await expect(
        poll(
          () => {
            calls++;
            return Promise.reject(new Error('async boom'));
          },
          { maxAttempts: 5, delayMs: 1, until: () => false },
        ),
      ).rejects.toThrow('async boom');
      expect(calls).toBe(1);
    });

    it('propagates an error thrown by `until`', async () => {
      await expect(
        poll(() => 1, {
          maxAttempts: 5,
          delayMs: 1,
          until: () => {
            throw new Error('until boom');
          },
        }),
      ).rejects.toThrow('until boom');
    });
  });

  describe('stopEmitter', () => {
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

    it('is safe to call `stop` more than once', async () => {
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
          stopEmitter: (stop) => {
            stop();
            stop();
          },
        },
      );

      expect(result).toBe(1);
      expect(calls).toBe(1);
    });

    it('is safe to call `stop` after polling has already resolved', async () => {
      let stop: () => void = () => {};
      const result = await poll(() => 1, {
        maxAttempts: 3,
        delayMs: 1,
        until: () => true,
        stopEmitter: (s) => {
          stop = s;
        },
      });

      expect(result).toBe(1);
      expect(() => stop()).not.toThrow();
    });

    it('keeps independent poll calls from interfering with each other', async () => {
      let stopA: () => void = () => {};
      let callsA = 0;
      let callsB = 0;

      const pollA = poll(
        () => {
          callsA++;
          return callsA;
        },
        {
          maxAttempts: 100,
          delayMs: 1000,
          until: () => false,
          stopEmitter: (s) => {
            stopA = s;
          },
        },
      );

      const pollB = poll(
        () => {
          callsB++;
          return callsB;
        },
        { maxAttempts: 3, delayMs: 1, until: (r) => r === 3 },
      );

      await expect(pollB).resolves.toBe(3);

      await new Promise((resolve) => setTimeout(resolve, 10));
      stopA();
      await expect(pollA).resolves.toBe(2);
    });
  });

  describe('onTick', () => {
    it('calls `onTick` with the result and attempt number of every attempt, including the last', async () => {
      const ticks: Array<[number, number]> = [];
      let calls = 0;

      const result = await poll(
        () => {
          calls++;
          return calls;
        },
        {
          maxAttempts: 5,
          delayMs: 1,
          until: (r) => r === 3,
          onTick: (r, attempt) => {
            ticks.push([r, attempt]);
          },
        },
      );

      expect(result).toBe(3);
      expect(ticks).toEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ]);
    });

    it('calls `onTick` for every attempt exhausted by `maxAttempts`', async () => {
      const ticks: Array<[string, number]> = [];

      await expect(
        poll(() => 'nope', {
          maxAttempts: 3,
          delayMs: 1,
          until: () => false,
          onTick: (r, attempt) => {
            ticks.push([r, attempt]);
          },
        }),
      ).rejects.toThrow(PollMaxAttemptsError);
      expect(ticks).toEqual([
        ['nope', 1],
        ['nope', 2],
        ['nope', 3],
      ]);
    });

    it('calls `onTick` for the final attempt triggered by `stopEmitter`', async () => {
      const ticks: number[] = [];
      let stop: () => void = () => {};
      let calls = 0;

      const promise = poll(
        () => {
          calls++;
          return calls;
        },
        {
          maxAttempts: 100,
          delayMs: 1000,
          until: () => false,
          onTick: (r) => {
            ticks.push(r);
          },
          stopEmitter: (s) => {
            stop = s;
          },
        },
      );

      await new Promise((resolve) => setTimeout(resolve, 10));
      stop();
      await promise;

      expect(ticks).toEqual([1, 2]);
    });

    it('is not required — `poll` behaves the same when `onTick` is omitted', async () => {
      const result = await poll(() => 1, {
        maxAttempts: 3,
        delayMs: 1,
        until: () => true,
      });

      expect(result).toBe(1);
    });

    it('propagates an error thrown by `onTick` without retrying', async () => {
      let calls = 0;

      await expect(
        poll(
          () => {
            calls++;
            return calls;
          },
          {
            maxAttempts: 5,
            delayMs: 1,
            until: () => false,
            onTick: () => {
              throw new Error('onTick boom');
            },
          },
        ),
      ).rejects.toThrow('onTick boom');
      expect(calls).toBe(1);
    });
  });
});
