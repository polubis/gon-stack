---
title: Always Handle All Interactive States Explicitly
impact: HIGH
impactDescription: Missing states cause broken UX — invisible focus, clickable-looking disabled buttons, no feedback on press
tags: accessibility, states, hover, focus, disabled
---

## Always Handle All Interactive States Explicitly

Every interactive component must explicitly style all relevant states: hover, focus-visible, disabled, and active/pressed. Never omit a state because it "looks fine by default".

**❌ Incorrect (states missing or using unsafe selectors):**

```tsx
// bare hover: fires even when disabled — disabled button appears hovered
<button className="hover:bg-(--btn-hover)" />

// no focus-visible — keyboard users get no focus ring
<button className="outline-none" />

// no disabled styles — disabled button is visually identical to enabled
<button className="bg-(--btn-bg)" />
```

**✅ Correct (all states covered with correct guards):**

```tsx
<button
  className={cn(
    // Hover: guard with enabled: so disabled elements never show hover style
    'enabled:hover:saturate-[1.2]',

    // Focus: use focus-visible (not focus) to skip mouse clicks
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-(--btn-focus) focus-visible:ring-offset-0',

    // Disabled: cursor + muted palette
    'disabled:cursor-not-allowed',
    'disabled:from-(--btn-primary-disabled-from) disabled:to-(--btn-primary-disabled-to)',
    'disabled:text-(--btn-primary-disabled-text) disabled:shadow-none',

    // Active / pressed (Radix UI data attribute)
    'data-[state=active]:scale-110 data-[state=active]:shadow-lg',
  )}
/>
```

| State          | Correct utility prefix         | Notes                                          |
| -------------- | ------------------------------ | ---------------------------------------------- |
| Hover          | `enabled:hover:`               | Never bare `hover:` on buttons/inputs          |
| Focus          | `focus-visible:`               | Skip `:focus` — it fires on mouse clicks too   |
| Disabled       | `disabled:`                    | Always pair with `disabled:cursor-not-allowed` |
| Active/pressed | `data-[state=active]:`         | Used with Radix UI primitives                  |
| Orientation    | `data-[orientation=vertical]:` | Radix UI layout variants                       |
