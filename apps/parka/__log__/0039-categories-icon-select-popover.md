# 0039 - Categories: icon as select field with popover

```json
{
  "status": "done"
}
```

Icon picker was an inline search + group chips + big grid. Now a select-like field (see 0038); search + icon grid live in one popover.

- `icon-picker.tsx` uses `SelectPopover`: trigger shows current icon (tinted by color) + label; popover has search + 5-col grid (max-h scroll), pick closes it. `Panel` is its own component so the query resets on each open.
- Group filter chips kept inside the popover (scroll horizontally), combined with search. New e2e id `categories:form-icon-groups`.
- e2e: `categories:form-icons` is now the trigger; flow opens it before `categories:form-icon-search`.

Decision: reuse `SelectPopover` as-is, search + group filter both inside the popover.

Reason: less content in form, consistent with color field.
