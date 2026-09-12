---
id: 0005
document: 0005-move-to-src-shared.md
module: shared/walkthrough
status: accepted
---

# 0005 — move module to `src/shared/walkthrough`

Ctx: module lived under `src/modules/shared/walkthrough`. Parka already keeps cross-cutting app concerns in `src/shared/` (`cookies`, `data-sources`, `server-contracts`). Walkthrough is app-wide infra, not a feature module — same bucket as cookies.

Decision: move folder to `src/shared/walkthrough`. Public import `@/shared/walkthrough` (mirrors `@/shared/cookies`). Keep layered internals unchanged; only external import paths + docs updated. `modules/shared/` stays UI/data for feature screens.

Consequence: callers import from `@/shared/walkthrough`; e2e root union imports `@/shared/walkthrough/configuration/e2e-ids`. No re-export shim in old path — single source.
