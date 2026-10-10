# @repo/uih

Headless React UI. Skeleton + `Button`.

## Conventions

1. Native element first (`Button.Root` -> `<button>`).
2. Parts API `Component.Part`. Context only when parts coordinate.
3. Native props + `ref` forwarded (React 19, `ComponentProps`).
4. Hooks: `data-ds-<name>` slot, `data-variant`, state `data-*`. No CSS import needed.
5. No Tailwind in components. Consumers pass `className`.
6. Theme = optional plain CSS, one file per component, in `@layer ds.*`, selectors in `:where()`.
7. Tokens `--ds-<component>-<part>`; defaults live in `var()` fallbacks (never set on each element), so ancestor override works.

## Imports

```ts
import { Button } from '@repo/uih/button';
import '@repo/uih/theme/tokens.css'; // optional
import '@repo/uih/theme/button.css'; // optional
import '@repo/uih/theme/all.css'; // bundle
```

## Override precedence (low -> high)

1. `var()` fallback in `button.css`
2. `tokens.css` global (`:root`)
3. Subtree: `[data-ds-theme]` wrapper / any ancestor sets `--ds-*`
4. Single instance: `style={{ '--ds-button-primary-bg': '...' }}`
5. Unlayered consumer CSS / `className` (beats all `@layer ds.*`, no `!important`)

## Not yet

Theme schema/runtime/editor, browser tests, other components.

## Tailwind app setup

Declare layer order before `@import 'tailwindcss'` so ds sits above preflight, below utilities (`className` utilities win):

```css
@layer theme, base, ds, components, utilities;
@import 'tailwindcss';
@import '@repo/uih/theme/button.css';
```

Tokens: see `src/theme/button.css` (`--ds-button-{radius,px,py,gap,font-size,font-weight,line-height,cursor,disabled-opacity,focus}` and `--ds-button-<variant>-{bg,fg,border,border-width,bg-hover}`). Variants: `primary | secondary | ghost | danger`. Reference: `apps/parka/src/core/style/index.css`.
