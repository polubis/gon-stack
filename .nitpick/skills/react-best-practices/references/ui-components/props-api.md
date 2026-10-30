---
title: Extend ComponentProps for Native Element Wrappers
impact: MEDIUM
impactDescription: Gives callers full native HTML API without maintaining a manual prop list
tags: props, typescript, api
---

## Extend ComponentProps for Native Element Wrappers

When a component wraps a native HTML element, always derive its props from `ComponentProps<'element'>`. Never write prop types from scratch — you would miss native attributes, event handlers, and `ref` forwarding.

**❌ Incorrect (manual prop list loses the native API):**

```tsx
type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  variant?: 'primary' | 'secondary';
  // missing: type, form, aria-*, data-*, ...
};
```

**✅ Correct (full native API inherited for free):**

```tsx
import { type ComponentProps } from 'react';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'; // only add what is truly new
};

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return <button className={cn('...', className)} {...props} />;
  //                                                  ^^^^^ spread all native props
};
```

For Radix UI primitives, derive from the primitive's own type:

```tsx
import * as SliderPrimitive from '@radix-ui/react-slider';

type SliderTrackProps = ComponentProps<typeof SliderPrimitive.Track>;
```

Always accept `className` and spread it last inside `cn()` so callers can override styles without fighting specificity.
