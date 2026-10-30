---
title: Export Multi-Part Components as Compound Objects
impact: MEDIUM
impactDescription: Compound exports give callers a ergonomic namespaced API while named exports preserve tree-shaking
tags: compound-components, api, structure
---

## Export Multi-Part Components as Compound Objects

Components made of multiple cooperating parts (e.g. Table, Slider, Dialog) must be exported both as individual named exports and collected into a single compound object. This gives callers a clean namespaced API (`<Table.Root>`) without sacrificing tree-shaking.

Sub-part naming: `<ComponentName><PartName>` — e.g. `TableTHead`, `SliderTrack`.

**❌ Incorrect (flat exports with no grouping):**

```tsx
// Callers must import every part individually with no namespace hint
export const Root = ...
export const Head = ...  // ambiguous without context
export const Body = ...
```

**✅ Correct (named exports + compound object):**

```tsx
/* =============================================================================
 * Root
 * ============================================================================= */
export const TableRoot = ({ className, ...props }: TableRootProps) => (
  <table
    className={cn('w-full border-collapse text-sm', className)}
    {...props}
  />
);

/* =============================================================================
 * THead
 * ============================================================================= */
export const TableTHead = ({ className, ...props }: TableTHeadProps) => (
  <thead className={cn('bg-(--table-head-bg)', className)} {...props} />
);

// ... other parts ...

/* =============================================================================
 * Compound Export
 * ============================================================================= */
export const Table = {
  Root: TableRoot,
  Thead: TableTHead,
  Tbody: TableTBody,
  Tfoot: TableTFoot,
  Tr: TableTr,
  Th: TableTh,
  Td: TableTd,
};
```

Usage:

```tsx
<Table.Root>
  <Table.Thead>
    <Table.Tr>
      <Table.Th>Name</Table.Th>
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    <Table.Tr>
      <Table.Td>Alice</Table.Td>
    </Table.Tr>
  </Table.Tbody>
</Table.Root>
```

When sub-parts need to share state, use the context pattern — see `context-shared-state.md`.
