---
ticket: none
scope: parka/expenses
summary: Duplicate action in expense row menu
why: Repeated purchases need one tap to copy an expense instead of retyping every field
date: 2026-10-24
tags: [parka, ux, expenses]
---

- Each expense row gets a "more" button (`Ellipsis`) like the time module `TaskMenu`
  - popover menu with arrow/Home/End keys, focus on the first item, `aria-label` with the shop name
  - menu is a sibling of the row button, so opening it never opens the popup
  - `ITEM` and `moveFocus` from the dashboard add menu are reused
- Menu item "Duplikuj" (`Copy`) links to `/app/expenses/new/?duplicate=<id>&month=<month>`
  - no new route, only the `NewExpenseQuery` type grew
  - Edytuj and Usun stay in the expense popup; the menu holds only quick actions
- New expense page loads the source through the existing `loadExpense` and reuses `NewExpenseForm`
  - skeleton while loading, `not-found` error state when the id is gone
  - saving uses the normal create flow (error toast with retry, no double save)
- The copy keeps shop, amount, category, payment method and products
  - date becomes now, products get fresh ids, source stays `manual`, device is the current one
  - rule link (`recurringId`) is not copied; shop/method memory prefill is off
- Tests anchor row queries with `^name`, since the menu button name also holds the shop
