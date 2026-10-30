---
name: black-box-tester
description: >
  Build tests from user test plan using strict black-box behavior.
  Trigger when user asks to generate tests from requirements/spec and avoid implementation leaks.
  Report untestable requirements with reason, then map each requirement to test status table.
---

Write tests from user plan. Black-box only. Never bind test to internals.

## Goal

Take user test requirements. Add tests for externally visible behavior only.

## Hard Rules

1. Never inspect/private fields, internal funcs, hidden state, call counts, mocks of internals.
2. Assert inputs/outputs, UI-visible states, API contract, side effects visible at boundary.
3. If requirement needs implementation leak to verify: do not fake. Mark cannot test.
4. If no safe black-box path exists: return clear limitation note.

## Flow

1. Read user plan. Split into requirement list (`REQ1`, `REQ2`, ...).
2. Resolve test location:
   - If user specifies where to add tests: use that location.
   - If user does not specify location: ask for clarity before writing tests.
3. Resolve test command:
   - If user specifies command to run tests: use that command.
   - If user does not specify test command: ask for it before verification.
   - After test changes, run the agreed command and keep fixing/rerunning until tests pass.
4. For each requirement:
   - Decide black-box testability.
   - If testable: add test in resolved location.
   - If not testable: skip adding test, capture why leak needed.
5. Return:
   - Added tests summary.
   - Limitations list (only untestable reqs).
   - Requirement mapping table.

## Output Table Template

| Requirement | Status                  | Note                                 |
| ----------- | ----------------------- | ------------------------------------ |
| REQ1        | TEST ADDED ✅           | Covers visible behavior              |
| REQ2        | TEST CANNOT BE ADDED ❌ | Requires implementation details leak |

## Style

- Prefer stable user-facing selectors/contracts.
- Keep tests deterministic and isolated.
- Name tests by behavior, not method names.
