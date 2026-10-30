---
title: Ban forwardRef; Use React 19 ref-as-prop API
impact: HIGH
impactDescription: Removes wrapper boilerplate and standardizes modern ref handling across all components
tags: refs, react-19, api-design
---

## Ban forwardRef; Use React 19 ref-as-prop API

Do not use `forwardRef` in new or refactored components. In React 19, `ref` is available as a normal prop, so components should accept `ref` directly in their props shape.

This keeps components simpler, avoids extra wrappers, and aligns the codebase with the current React API direction.

**❌ Incorrect (legacy forwardRef wrapper):**

```tsx
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        data-invalid={invalid}
        className={className}
        {...props}
      />
    );
  },
);
```

**✅ Correct (React 19 ref-as-prop):**

```tsx
import { type ComponentPropsWithRef } from 'react';

type InputProps = ComponentProps<'input'> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ref, ...props }: InputProps) {
  return (
    <input ref={ref} data-invalid={invalid} className={className} {...props} />
  );
}
```

If you expose an imperative API, keep using `useImperativeHandle`, but consume `ref` from props instead of `forwardRef`.

Reference: [React Docs - `forwardRef` (Deprecated in React 19)](https://react.dev/reference/react/forwardRef)
