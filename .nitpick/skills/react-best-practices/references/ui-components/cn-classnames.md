---
title: Use cn() for All Class Name Composition
impact: MEDIUM
impactDescription: Prevents class conflicts and handles conditional/array class merging cleanly
tags: tailwind, classnames, cn, styling
---

## Use cn() for All Class Name Composition

All class name composition must go through the local `cn` helper (clsx + tailwind-merge). Never concatenate strings, use ternaries directly in `className`, or call `clsx`/`twMerge` separately.

**❌ Incorrect (string concatenation causes merge conflicts):**

```tsx
<button
  className={`base-class ${variant === 'primary' ? 'bg-pink-500' : 'bg-blue-500'} ${className}`}
/>
// tailwind-merge never runs — duplicate utilities will NOT be deduplicated
```

**✅ Correct (cn handles merging and conditional classes):**

```tsx
import { cn } from './cn';

<button
  className={cn(
    'inline-flex items-center justify-center', // base
    variant === 'primary' && 'bg-(--btn-primary-bg)',
    variant === 'secondary' && 'bg-(--btn-secondary-bg)',
    className, // caller overrides always last
  )}
/>;
```

Group several related variant classes as an array literal — it keeps each variant block readable:

```tsx
variant === 'primary' && [
  'text-(--btn-primary-text)',
  'bg-linear-to-r from-(--btn-primary-from) to-(--btn-primary-to)',
  'shadow-lg shadow-(color:--btn-primary-glow)',
],
```
