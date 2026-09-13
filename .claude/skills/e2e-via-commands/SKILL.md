---
name: e2e-via-commands
description: >
  Use when creating/extending e2e tests with step interpreter and shared commands,
  where test engine + interpreter path/contract must be confirmed before execution.
---

Build e2e via interpreter.

## Goal

Turn behavior spec into step map + interpreter execution.

## Preflight (Mandatory)

Before any test:

1. Resolve test engine:
   - infer from user prompt/repo context if clear
   - if not clear, ask user before writing tests
2. Ask user for interpreter path (or propose found candidate).
3. Resolve verification command type:
   - infer from prompt/context if clear (`test`, `e2e`, `nx`, `pnpm`, etc.)
   - if not clear, ask user which command to run for verification
4. Confirm contract in 2-4 lines: command map shape, execute-call shape, async/error behavior.
5. If engine, verification command, or contract unclear: stop, ask, no test writing.

## Test Shape

1. Import interpreter entry + test API from resolved engine.
2. Put static mocks/fixtures first.
3. Add `commands` object:
   - key = readable step text
   - value = fn `(page) => ...` or `async (page) => ...`
4. Each `test(...)` runs steps through interpreter.
5. Inline actions only for tiny one-off checks.

## Command Rules

- One command = one visible user/system behavior.
- Use role/placeholder/text selectors only. No internals.
- Await engine actions; no sleeps/timeouts.
- Reuse command keys across tests; add new keys only for new behavior.
- Test titles describe behavior, not implementation.
- Assertions verify visible outcome.

## Build Flow

1. Read spec/requirements.
2. Convert requirements into scenarios.
3. Split into reusable commands.
4. Add missing commands.
5. Compose scenario by ordered step tuples.
6. Assert visible outcomes.
7. Add edge cases (bounds, back nav, invalid state).

## Done Criteria

- Tests deterministic on repeat runs.
- Engine explicitly resolved (inferred or user-confirmed).
- Verification command type resolved (inferred or user-confirmed).
- Interpreter path + contract documented before execution.
- Shared setup via interpreter, no copy-paste flow blocks.
- Assertions cover user-visible text/state.
- File stays compact: commands block + script-like tests.
