# Writing Guidelines for React UI Component References

This document provides guidelines for creating effective React best practice
references that work well with AI agents and LLMs.

## Key Principles

### 1. Concrete Transformation Patterns

Show exact TSX rewrites. Avoid philosophical advice.

**Good:** "Use `ComponentProps<'button'>` instead of a manual `type ButtonProps = { onClick?: () => void }`"
**Bad:** "Design good component APIs"

### 2. Error-First Structure

Always show the problematic pattern first, then the solution. This trains agents
to recognize anti-patterns.

```markdown
**❌ Incorrect (description of problem):** [bad example]

**✅ Correct (description of solution):** [good example]
```

### 3. Quantified Impact

Include specific benefits. Helps agents prioritize fixes.

**Good:** "Caller gets the full native `<button>` API for free", "Prevents class conflicts", "Breaks theming"
**Bad:** "Better", "More correct", "Cleaner"

### 4. Self-Contained Examples

Examples should be complete and renderable (or close to it). Include imports
and type definitions when they add clarity.

```tsx
// Include imports when they matter
import { type ComponentProps } from 'react';
import { cn } from './cn';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => <button className={cn('...', className)} {...props} />;
```

### 5. Semantic Naming

Use meaningful component and prop names. Names carry intent for LLMs.

**Good:** `Button`, `variant`, `onValueChange`, `isControlled`, `SliderRoot`
**Bad:** `Comp`, `v`, `fn`, `x`, `Thing`

---

## Code Example Standards

### TSX Formatting

```tsx
// Use clear formatting and real prop names
export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center',
      variant === 'primary' && 'bg-(--btn-primary-bg)',
      className,
    )}
    {...props}
  />
);
```

### Comments

- Explain _why_, not _what_
- Highlight the specific issue or benefit
- Point out common pitfalls or edge cases

### Language Tags

- `tsx` — React components and JSX
- `ts` — Pure TypeScript (utility types, helpers)
- `css` — CSS custom property definitions

---

## When to Include CSS

**Default: TSX Only**

Most references should focus on pure component patterns. This keeps examples focused.

**Include CSS When:**

- Defining design tokens (`@theme` or `:root` blocks)
- Showing typography utility class definitions
- Demonstrating color-mix() token patterns

**Format for Mixed Examples:**

````markdown
**✅ Correct (tokens defined in CSS, consumed in TSX):**

```css
@theme {
  --btn-primary-bg: var(--color-primary-500);
}
```

```tsx
<button className="bg-(--btn-primary-bg)" />
```
````

---

## Impact Level Guidelines

| Level           | Improvement     | Use When                                              |
| --------------- | --------------- | ----------------------------------------------------- |
| **CRITICAL**    | Breaks usage    | Missing native props, controlled-only component       |
| **HIGH**        | Major UX gap    | Hardcoded colors, missing focus/disabled state        |
| **MEDIUM-HIGH** | API friction    | Object maps vs `cn()`, prop-drilling vs context       |
| **MEDIUM**      | Maintainability | Unsectioned files, wrong typography scope             |
| **LOW-MEDIUM**  | Consistency     | Inconsistent transition properties                    |
| **LOW**         | Polish          | Wrong animation duration, minor style inconsistencies |

---

## Reference Standards

**Primary Sources:**

- React official documentation (react.dev)
- Radix UI Primitives documentation
- Tailwind CSS documentation
- tailwind-merge documentation
- Project codebase patterns

**Format:**

```markdown
Reference: [React ComponentProps](https://react.dev/reference/react/Component)
```

---

## Review Checklist

Before adding a reference:

- [ ] Title is clear and action-oriented
- [ ] Impact level matches the actual consequence
- [ ] `impactDescription` includes a concrete benefit or risk
- [ ] Explanation is concise (1-2 sentences)
- [ ] Has at least 1 **❌ Incorrect** TSX example
- [ ] Has at least 1 **✅ Correct** TSX example
- [ ] TSX uses semantic naming
- [ ] Comments explain _why_, not _what_
- [ ] Trade-offs mentioned if applicable
- [ ] `AGENTS.md` updated to reference the new file
