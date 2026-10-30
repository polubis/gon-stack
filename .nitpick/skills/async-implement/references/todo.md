# TODO Example For Async Implement

This file demonstrates what the model may receive during `async-implement` skill invocation.

## Global Directives

- preferred_model: fast
- run_in_parallel: true
- isolate_each_task_in_worktree: true

## Tasks

- [ ] Add request validation to `apps/romantic-app/src/pages/api/config/user-profile.ts`.
  - Ensure payload has required fields and safe defaults.
  - Return consistent error shape for invalid input.

- [ ] Add unit tests for the validation behavior.
  - Cover missing required fields.
  - Cover accepted valid payload.

- [ ] Update docs for the new validation rules.
  - Add a short section in the relevant module README.

## Notes

- If a task does not define a model, use `preferred_model`.
- Do not ask clarification questions; pick reasonable defaults and implement.
