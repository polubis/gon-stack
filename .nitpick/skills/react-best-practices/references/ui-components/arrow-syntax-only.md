---
title: Use Arrow Syntax for React and Related Logic
impact: MEDIUM
impactDescription: Standardizes function style across components, hooks, and helpers for consistent readability and refactors
tags: syntax, consistency, functions
---

## Use Arrow Syntax for React and Related Logic

Use arrow syntax for all React-related implementation code and adjacent logic (components, hooks, event handlers, mappers, local helpers, and callbacks). Do not define these with `function` declarations.

This keeps style consistent across the codebase and avoids mixed function declaration patterns in the same file.

**❌ Incorrect (mixed function declarations):**

```tsx
function log(name: string) {
  console.log('something');
}

function ProfileCard({ name, onOpen }: ProfileCardProps) {
  function handleClick() {
    log();
    onOpen?.();
  }

  return <button onClick={handleClick}>{name}</button>;
}
```

**✅ Correct (arrow syntax everywhere):**

```tsx
const log = () => {
  console.log('something');
};

const ProfileCard = ({ onOpen }: ProfileCardProps) => {
  const handleClick = () => {
    log();
    onOpen?.();
  };

  return <button onClick={handleClick}>{name}</button>;
};
```

Keep this rule for implementation code. If a framework or tooling API explicitly requires `function` declarations, follow that API contract.

Reference: [React Docs](https://react.dev/)
