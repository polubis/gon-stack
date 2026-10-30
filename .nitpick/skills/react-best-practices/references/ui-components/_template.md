---
title: Clear, Action-Oriented Title (e.g., "Use cn() for All Class Name Composition")
impact: MEDIUM
impactDescription: Short quantified benefit (e.g., "Prevents class conflicts and handles conditional class merging cleanly")
tags: styling, tailwind, cn
---

## [Rule Title]

[1-2 sentence explanation of the problem and why it matters. Focus on the developer/user impact.]

**❌ Incorrect (describe the problem):**

```tsx
// Comment explaining what makes this wrong
type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  // missing native attributes
};
```

**✅ Correct (describe the solution):**

```tsx
// Comment explaining why this is better
import { type ComponentProps } from 'react';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'; // only add what is truly new
};
```

[Optional: Additional context, edge cases, or trade-offs]

Reference: [React Docs](https://react.dev/)
