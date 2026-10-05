# 0020 - floating add-expense button, fixed month select

```json
{
  "status": "done"
}
```

- Header `Dodaj wydatek` stays from md up (left of the select); on mobile (<md) it is replaced by a round icon-only `+` (`dashboard:expense-fab`, aria-label `Dodaj wydatek`) in a zero-height sticky rail above the bottom nav. `<main>` has `pb-24` on mobile so content scrolls clear of it.
- In-card `Dodaj wydatek` hidden on mobile (duplicate of the floating one).
- Month select: full width on mobile, fixed `md:w-52` at the right end of the header from md up.
