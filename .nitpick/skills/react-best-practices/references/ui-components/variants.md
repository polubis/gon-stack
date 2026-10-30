---
title: Use Conditional cn() Branches for Variant Styles
impact: MEDIUM
impactDescription: Lookup maps bypass cn() merging and make overrides unpredictable
tags: variants, styling, cn
---

## Use Conditional cn() Branches for Variant Styles

Variant styles must be applied via conditional `cn()` branches. Never use object maps or lookup tables — they bypass `tailwind-merge` and make caller overrides fragile.

Standard variant prop signature: `variant?: 'primary' | 'secondary'`, defaulting to `'primary'`.

**❌ Incorrect (lookup map skips cn merging):**

```tsx
const variantClasses = {
  primary: 'bg-(--btn-primary-bg) text-(--btn-primary-text)',
  secondary: 'bg-(--btn-secondary-bg) text-(--btn-secondary-text)',
};

<button className={`base ${variantClasses[variant]} ${className}`} />;
// className overrides won't correctly deduplicate against variantClasses
```

**✅ Correct (conditional branches inside cn):**

```tsx
export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-(--btn-radius)',
      variant === 'primary' && [
        'bg-linear-to-r from-(--btn-primary-from) to-(--btn-primary-to)',
        'text-(--btn-primary-text)',
        'shadow-lg shadow-(color:--btn-primary-glow)',
        'enabled:hover:saturate-[1.2]',
        'disabled:from-(--btn-primary-disabled-from) disabled:to-(--btn-primary-disabled-to)',
      ],
      variant === 'secondary' && [
        'border border-(--btn-secondary-border) bg-(--btn-secondary-bg)',
        'text-(--btn-secondary-text)',
        'enabled:hover:bg-(--btn-secondary-bg-hover)',
        'disabled:border-(--btn-secondary-disabled-border)',
      ],
      className,
    )}
    {...props}
  />
);
```
