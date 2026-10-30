---
title: Use Consistent Transition Timing per Interaction Type
impact: LOW
impactDescription: Mismatched durations make the UI feel inconsistent — fast hover, slow press, or laggy focus ring
tags: transitions, animation, timing
---

## Use Consistent Transition Timing per Interaction Type

Always apply transitions to interactive components. Use the correct duration class for each type of state change — the durations below are calibrated to feel responsive without being jittery.

**❌ Incorrect (no transition or wrong timing):**

```tsx
// No transition — state changes feel instant and jarring
<button className="bg-(--btn-primary-bg) hover:saturate-[1.2]" />

// Too slow for a hover — feels sluggish
<button className="transition-all duration-500" />
```

**✅ Correct (timing matched to interaction type):**

```tsx
// All properties — used for general interactive elements (buttons, inputs)
'transition-all duration-160 ease-in-out';

// Specific properties — used when animating transform + shadow together (thumbs, toggles)
'transition-[transform,box-shadow] duration-150';

// Color only — used for row hover, subtle bg shifts
'transition-colors duration-100';
```

Reference:

| Context                                  | Class                                            |
| ---------------------------------------- | ------------------------------------------------ |
| Button, Input, general interactive       | `transition-all duration-160 ease-in-out`        |
| Scale + shadow (e.g. slider thumb press) | `transition-[transform,box-shadow] duration-150` |
| Row hover, color-only shifts             | `transition-colors duration-100`                 |
