# 0006 - limits and goals widgets

```json
{
  "status": "done"
}
```

`modules/limits` moved into dashboard. `xl` top row: `LimitsCard` | `GoalsCard` | KPIs (1 col), 1/3 each; stack below `xl`.

- `LimitsCard` (`#limits`): total limit headline + "Zmień"; category limits scroll below; "Dodaj limit". Pencil per row -> "Edytuj limit" sheet (category fixed) + danger "Usuń limit". All optimistic, toast, rollback.
- `GoalsCard` (`#goals`): goals list, "Dodaj cel".
- No jump: cards fixed `h-112 md:h-128`, lists scroll inside (`pr-2` gap), forms in `LimitsSheet` over card (`inert` base, `aria-modal`, Tab trap, Esc/X, focus back via `useSheet`).
- Forms: `<form onSubmit>`, `required`. Select lists free categories only. None left: "Dodaj limit" `aria-disabled` + tooltip (`AddLimitButton`).
- Own load (`[TRIGGER]_LOAD_LIMITS`): limits failure never hides summary/expenses. Goals error code `DASHBOARD_GOALS_LOAD`.
- Total-limit edit patches `summary.monthlyLimit` -> KPI updates; restored on fail.
- "Limity" quick action + KPI "Ustaw limit" -> `focusSection` (scroll + focus `#limits`).
- Tests: unit `selectors`/`mappers`; integration `category-limits-flow` (store), `limits-card` (component), both msw; e2e raise + remove limit.
- Rule `ui.md` 6: scroll lists keep `pr-2` gap.

Removed: `modules/limits`, `/app/limits/`, nav tab, settings link, in-card tabs, `LimitsE2eId`/`GoalsE2eId`. `/api/limits`, `/api/goals` stay.

Gap: no way to create total limit when none.
