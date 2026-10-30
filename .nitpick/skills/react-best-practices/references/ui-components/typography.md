---
title: Use Typography Utility Classes Only on Raw Elements — Components Own Their Typography
impact: MEDIUM
impactDescription: Applying shared type classes to components removes their ability to fine-tune size, weight, and spacing independently
tags: typography, design-tokens, text
---

## Use Typography Utility Classes Only on Raw Elements — Components Own Their Typography

The project defines a set of single-letter typography utility classes in the main CSS configuration file (look for `@layer components` in the project's global CSS). These classes are intended **only for raw HTML elements** used directly in layouts and pages (`<h1>`, `<p>`, `<span>`, `<li>`, etc.).

UI components (`Input`, `Button`, `Badge`, `Table`, etc.) must **never** use these shared classes. Each component defines its own typography internally via dedicated Tailwind utilities, giving it full control over size, weight, tracking, and color independent of the global scale.

**❌ Incorrect (applying shared type class to a component — locks its typography):**

```tsx
// Input can no longer tune its own size, weight, or spacing
<Input className="b2" />

// Badge loses its custom tracking and casing
<Badge className="l1" />

// Table cell forced into body rhythm instead of its own compact style
<TableTd className="b3" />
```

**✅ Correct (raw elements use utility classes; components own their styles internally):**

```tsx
// Raw elements in pages / layouts → use utility classes
<h1 className="t1">Welcome</h1>
<p className="b2">Here is some body copy.</p>
<span className="l1">Category</span>

// Components → typography is hardcoded inside the component definition
export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      'text-sm text-(--input-text)',           // component owns its size + color
      'placeholder:text-(--input-placeholder)', // component owns its placeholder style
      className,
    )}
    {...props}
  />
);

export const TableTh = ({ className, ...props }: TableThProps) => (
  <th
    className={cn(
      'text-xs font-semibold uppercase tracking-[0.14em] text-(--table-head-text)', // own type style
      className,
    )}
    {...props}
  />
);
```

Find the available utility classes in the project's main CSS file under `@layer components`. The standard set for raw elements:

| Class     | Role                  | Font                                      |
| --------- | --------------------- | ----------------------------------------- |
| `t1`–`t6` | Headings h1–h6        | heading font (large → small)              |
| `b1`–`b3` | Body text             | sans, base → xs                           |
| `l1`–`l2` | Labels                | sans, semibold/medium, uppercase, tracked |
| `v1`–`v2` | Overlines / eyebrows  | sans, heavy tracking, uppercase           |
| `c1`–`c2` | Captions              | sans, small, normal case                  |
| `o1`–`o2` | Oblique / italic text | sans, italic, light tracking              |

Color comes from the semantic token each class references — never override text color with a raw Tailwind color class on top of these utilities.
