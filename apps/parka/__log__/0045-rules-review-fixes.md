# 0045 - Fixes from rules review

```json
{
  "status": "done-with-clarification"
}
```

Reviewer agent checked all changes against `.claude/rules`. Fixed:

- testing E2E: per-item type-safe ids `categories:form-color-option:${string}`, `categories:form-icon:${string}` (static ids removed).
- ux #2/#6: `EditorSkeleton` mirrors the form (3 fields + buttons) instead of the removed preview card.
- a11y: `SelectPopover` trigger named by label + current value (`aria-labelledby`); name input `aria-describedby` its error.
- ux #8: empty icon search message uses trimmed query.
- typescript: `CATEGORY_NOT_FOUND` moved into `ERROR_CODES`.
- tests: `categories/__tests__/pickers.test.tsx` (color pick, custom swatch, icon search, empty result, group filter); screen-header test no longer leaks `document.referrer`.

Not changed (needs a decision):
- ux #10 beyond categories (other modules, categories ErrorBoundary fallback) - scope was categories only.
- color swatch names are hex codes - needs a color-name table.
- shared header wrapper duplicated in 3 files; git split into one commit per decision.

Reason: rule compliance.
