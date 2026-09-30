# 0020 - remove hashy and module AGENTS.md

```json
{
  "status": "done"
}
```

Removed only `AGENTS.md` files that carry Hashy frontmatter (`hash:`) under Parka modules and romantic-app `user-profile-setup`, plus the `templates/AGENTS.md` scaffold. Left untouched module docs without a hash (e.g. `shared/router`, `shared/walkthrough`). Removed the `@repo/hashy` package, the `hashy` and `document-module` skills, and `hashy.modules.txt`. Dropped `pnpm hash:*` scripts and the Hash check job from PR CI and Parka deploy verify. Updated `clone`, `feature-workflow`, `frontend-architecture.md`, and romantic-app eval prompts to use the architecture reference and module scans instead of stamped module agent docs.

Hash-stamped module docs duplicated `frontend-architecture.md` and forced hash drift checks in CI without clear benefit; dropping the toolchain simplifies agent guidance and CI while keeping non-Hashy module docs.
