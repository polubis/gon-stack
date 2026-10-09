# 0038 - Categories: color as select field with popover

```json
{
  "status": "done"
}
```

Color picker was a wide inline swatch row plus custom-color input. Now a select-like field; swatches live in one popover (same on mobile + desktop).

- New `shared/ui/select-popover.tsx`: generic select field (label, value, chevron) opening Radix Popover at trigger width; children get `close`.
- `color-picker.tsx` uses it: trigger shows current color dot, popover shows 5-col preset grid, pick closes it. Existing non-preset color stays as extra swatch.
- Removed "Własny kolor" input. e2e ids: `categories:form-color-custom` -> `categories:form-color-option` (trigger stays `categories:form-color`).
- Dep `@radix-ui/react-popover` 1.2.0 via new pnpm `catalog:` in `pnpm-workspace.yaml` (one version across monorepo).

Decision: Radix Popover (same family as `react-dialog`); one popover for all viewports, no bottom sheet.

Reason: less content in form, consistent select-field UX, single dep version.
