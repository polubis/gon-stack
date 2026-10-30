---
title: Use Section Comments to Structure Component Files
impact: LOW
impactDescription: Consistent file layout makes components scannable and maintainable across the team
tags: structure, conventions, readability
---

## Use Section Comments to Structure Component Files

Every UI component file must be divided into clearly labeled sections using the standard banner comment. This makes it immediately obvious where types, logic, and markup live without reading the whole file.

**❌ Incorrect (no section separation):**

```tsx
export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return <button className={cn('...', className)} {...props} />;
};
```

**✅ Correct (sections clearly separated):**

```tsx
/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return <button className={cn('...', className)} {...props} />;
};
```

For compound components, add a final section:

```tsx
/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Table = { Root: TableRoot, Thead: TableTHead, ... };
```
