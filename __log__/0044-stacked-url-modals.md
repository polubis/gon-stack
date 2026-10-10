# 0044 - stacked modals living in URL (rules + parka)

```json
{
  "status": "done"
}
```

Rules: `rules/ux.md` +12 modal opened over another stacks on top, previous stays mounted. +13 open modals live in URL query params, stack order kept, deep link/reload restores, Back closes only top. `CLAUDE.md` ux row updated.

Parka: `shared/router/modal-stack.ts` (`openModal`/`closeModal`/`useModal`/`useModalStack`/`useModalMounted`), repeated `?modal=` params, bottom first. Open = `pushUrl` (history entry tagged `modalDepth`); close top pushed = `history.back()` (same as Back), deep-linked/buried = replace. Settled-prefix gate mounts URL-loaded stack bottom-up (Radix `hideOthers` would else aria-hide the top). Double close guarded (`closing`). Wired: categories legend + expenses show-all, expense/recurring detail (opens over list, no more close-then-open), limit sheets (`useSheet`), category delete confirm, cookie preferences. Stale expense id pruned from URL. Router shell navigator now takes state + flushes. Tests: `modal-stack.test.tsx`, `modals-flow.test.tsx`, e2e `modal-stack.spec.ts`; setup resets URL per test. Proof video: `stacked-modals-proof.webm` (root).

Reason: modals behave like navigation; Back must close one modal at a time, links/reload must restore the stack.
