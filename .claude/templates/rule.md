---
name: black-box-api
---

Always connect with API via functions, not directly via `fetch`, `axios.get`, or other.

**💥 Incorrect (do not call API's without abstraction):**

```tsx
const User = () => {
  useEffect(() => {
    fetch(); // Direct call inside component
  }, []);
};
```

**✅ Correct (call API's via abstracted functions):**

```tsx
import { getUser } from "function";

const User = () => {
  useEffect(() => {
    getUser();
  }, []);
};
```
