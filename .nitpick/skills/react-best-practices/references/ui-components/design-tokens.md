---
title: Reference Semantic Design Tokens — Never Hardcode Colors
impact: HIGH
impactDescription: Hardcoded values break theming and make global design changes require mass find-replace
tags: design-tokens, css-variables, theming, colors
---

## Reference Semantic Design Tokens — Never Hardcode Colors

All colors, radii, shadows, and other design values must come from CSS custom properties defined in the project's main CSS configuration file (typically `index.css` or a global theme file). Never hardcode Tailwind palette classes or raw values inside component code.

**❌ Incorrect (hardcoded values break theming):**

```tsx
// Hardcoded Tailwind palette — breaks if the design changes
<button className="bg-pink-500 text-white shadow-pink-400/50 rounded-lg" />

// Hardcoded hex — completely opaque to the design system
<input className="border-[#7dd3fc] bg-[#0c1a2e]" />
```

**✅ Correct (semantic tokens from the CSS config):**

```tsx
// Tokens are resolved from the main CSS configuration file
<button className="bg-(--btn-primary-bg) text-(--btn-primary-text) shadow-(color:--btn-primary-glow) rounded-(--btn-radius)" />

<input className="border-(--input-border) bg-(--input-bg) text-(--input-text)" />
```

**Token naming convention:** `--<component>-<element>-<property>`

```css
/* In the main CSS configuration file */
@theme {
  --btn-primary-bg: var(--color-primary-500);
  --btn-primary-text: var(--color-text-primary);
  --btn-primary-glow: color-mix(
    in srgb,
    var(--color-primary-400) 50%,
    transparent
  );
  --btn-radius: 0.625rem;

  --input-border: color-mix(
    in srgb,
    var(--color-secondary-300) 45%,
    transparent
  );
  --input-bg: color-mix(in srgb, var(--color-surface-50) 80%, transparent);
}
```

When creating a new component, first locate the main CSS configuration file in the project, then add all required semantic tokens there before using them in the component. Semi-transparent values use `color-mix(in srgb, var(--color-X) <percent>%, transparent)`.
