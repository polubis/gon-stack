# 0001 - isolated module rewrite

```json
{
  "status": "done"
}
```

Dropped `@/modules/shared/data`. Layered EDA module; loads `/api/categories` on mount; save = POST expense + notification, `$saved` triggers navigation, failure -> toast. Skeleton, `LoadingBanner`, `ErrorState`, tokens only, tests.
