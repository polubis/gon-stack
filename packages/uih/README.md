# @repo/uih

Headless React UI + optional plain-CSS theme. Rules: [`docs/`](docs/0-vision.md).

## Components

- `Button` - axes `appearance` (`solid`), `color` (`primary`), `size` (`s | m | l`).

## Imports

```ts
import { Button } from '@repo/uih/button';
```

```css
@import '@repo/uih/themes/aurora/index.css'; /* tokens + reset + typography */
@import '@repo/uih/button/index.css';
```

Theme files are separate units: `themes/aurora/{tokens,scale,reset,typography,animations,index}.css`. `scale.css` (device scale on the root font size) is optional.

## Tests

- `pnpm test` unit. `pnpm test:e2e` builds uih-docs and checks the scale board at every breakpoint (snapshot per platform, `pnpm test:e2e:update-snapshots` to refresh).

## Override ladder (least to most invasive)

1. Semantic token on a `[data-ds-theme]` scope: `--ds-color-primary`
2. Component token on any wrapper: `--ds-button-{bg,fg,border-color,radius,gap,shadow,gloss}`
3. Hook selector: `[data-ds='button'][data-size='l']`
4. `className` / `style` (all selectors are `:where()`, specificity 0)

## Tailwind app setup

```css
@layer theme, base, ds, components, utilities;
@import 'tailwindcss';
@import '@repo/uih/themes/aurora/index.css';
@import '@repo/uih/button/index.css';
```
