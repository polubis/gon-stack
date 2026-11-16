---
ticket: VYB-312
scope: parka/knowledge
summary: Add knowledge mapper, repository and failure rollback tests
why: Knowledge module had only view flow tests; wire mapping, gateway seam and create/delete failure paths were uncovered.
date: 2026-11-16
---

- Picked knowledge: newest module, 37 source files, 3 test files, not in VYB-914..927 coverage loop
- Unit tests for mappers (unknown status and brain area fall back) and repository over the mock gateway
- Flow tests: create failure rolls back and retry recovers, delete failure restores the node
- Black box via public gateway seam, accessible selectors, no msw needed as module has no HTTP yet
