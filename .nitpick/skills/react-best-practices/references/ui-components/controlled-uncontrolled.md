---
title: Support Both Controlled and Uncontrolled Usage
impact: MEDIUM
impactDescription: Components that only support one mode force callers to add unnecessary state or lose flexibility
tags: controlled, uncontrolled, state, api
---

## Support Both Controlled and Uncontrolled Usage

Stateful components must work in both controlled mode (caller owns the value via `value` + `onChange`) and uncontrolled mode (component manages its own internal state via `defaultValue`). Detect the mode via an `isControlled` flag — never infer it from `undefined` comparisons.

**❌ Incorrect (controlled-only forces callers to add state):**

```tsx
export const Slider = ({ value, onValueChange }) => {
  // only works if the caller manages state — breaks uncontrolled usage
  return <SliderPrimitive.Root value={value} onValueChange={onValueChange} />;
};
```

**✅ Correct (isControlled pattern handles both modes):**

```tsx
export const SliderRoot = ({
  value,
  defaultValue,
  min = 0,
  onValueChange,
  ...props
}: SliderRootProps) => {
  const [internalValue, setInternalValue] = useState<number[]>(() =>
    getResolvedValues(value, defaultValue, min),
  );

  const isControlled = Array.isArray(value);
  const values = isControlled ? value : internalValue;

  const handleValueChange = (next: number[]) => {
    if (!isControlled) {
      setInternalValue(next); // update internal state only when uncontrolled
    }
    onValueChange?.(next); // always fire the callback so callers can observe
  };

  return (
    <SliderPrimitive.Root
      value={isControlled ? value : undefined}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      {...props}
    />
  );
};
```

Resolve the initial value from either `value` or `defaultValue` in a helper to keep the `useState` initializer clean:

```tsx
const getResolvedValues = (
  value: number[] | undefined,
  defaultValue: number[] | undefined,
  min: number,
): number[] => {
  if (Array.isArray(value) && value.length > 0) return value;
  if (Array.isArray(defaultValue) && defaultValue.length > 0)
    return defaultValue;
  return [min ?? 0];
};
```
