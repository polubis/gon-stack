## Styling

1. (A) No raw `px`
2. (A) Design tokens
3. (A) No direct colors/spacing/z-index/fonts
4. (A) Theming in single app/lib file
5. (A) `cn` from `react-kit`
6. (A) Z-index scale only in top of app `index.css` as tokens, low to high: raised, modal/dialog, popover/menu, toast, tooltip
7. (A) Use scale tokens everywhere (`z-(--z-toast)`), never raw `z-*` values
8. (A) Toast stays above modals, reachable, dismiss never closes modal
