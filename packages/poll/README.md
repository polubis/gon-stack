# @repo/poll

Generic async polling helper.

```ts
import { poll } from '@repo/poll';

const result = await poll(() => checkJobStatus(jobId), {
  maxAttempts: 20,
  delayMs: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  until: (status) => status === 'done',
});
```

## Options

- `maxAttempts` — max number of calls to the polled function before `poll` rejects with `PollMaxAttemptsError`.
- `delayMs` — wait between attempts, either a fixed number or `(attempt: number) => number`, `attempt` being the 1-based iteration that just ran.
- `until` — predicate over the latest result; once it returns `true`, `poll` resolves with that result.
- `stopEmitter` — optional. Called once with a `stop` callback. Invoking `stop()` cancels any pending delay, runs the polled function one last time, and resolves with that result regardless of `until`.
