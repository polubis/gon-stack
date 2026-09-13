---
version: 1.0.0
name: Migrating to TypeScript 7
cdate: 02.09.2026
mdate: 02.09.2026
tags: typescript,turborepo,monorepo,migration,tooling,eslint
---

# Migrating to TypeScript 7 (native compiler)

TypeScript 7.0 is the Go-native rewrite of the compiler + language service
(project "Corsa"). Same `typescript` package, same `tsc` command, now a native
binary. ~8–12x faster builds, ~10x faster editor, 6–26% less memory.

TS 6.x was the last JS-based release. Every TS 6 deprecation becomes a hard error
in TS 7. This repo is already pinned to `typescript@6.0.3` everywhere — the
correct staging point. The 6 → 7 move is a **config + tooling** job, not a
source-code job.

---

## Spike result (02.09.2026)

Bumped `typescript` `6.0.3` → `7.0.2` in all 9 workspaces that pin it, then ran
`turbo run check-types build lint`.

| Task                                                                                                            | Result                                    |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `check-types` — `apps/web`, `apps/docs` (`tsc --noEmit` on 7.0.2)                                               | ✅ 0 errors                               |
| `check-types` — `react-kit`, `ui`, `type-beast`, `hashy`, `vibe-test`, `astro-config` (`tsc --noEmit` on 7.0.2) | ✅ 0 errors                               |
| `build` — 14 tasks (`astro build` ×5, `next build` ×2, `tsc` lib emit)                                          | ✅ all pass                               |
| `astro check` — 5 Astro apps                                                                                    | ✅ 0 errors (**still TS 6** — see caveat) |
| `lint` — every workspace                                                                                        | ❌ **hard fail**                          |

**Source compiles and builds clean on TS 7.** No `baseUrl` / removed-flag errors;
`packages/typescript-config/base.json` is already TS-7-valid.

**Lint is the blocker:**

```
typescript-eslint does not support TS 7.0.
See github.com/typescript-eslint/typescript-eslint/issues/10940 (tracks TS >=7.1)
```

`typescript-eslint@8.69.0` peer is `typescript: >=4.8.4 <6.1.0`. No stable release
supports TS 7 yet. All `lint` runs through `@repo/eslint-config` → all fail.
`pnpm ci:verify` (which runs `lint`) cannot go green on a bare bump.

**Caveat — Astro apps never actually moved.** They have no direct `typescript`
dep; `astro` / `@astrojs/check` bring their own (6.0.3 / 5.9.3).
`require.resolve('typescript')` from an Astro app dir → _none_. Their green
`astro check` was still TS 6. Forcing them onto 7 needs the stable programmatic
API, which Astro's language tooling imports in-process — not available until
TS 7.1.

Spike was reverted. No code landed.

---

## Blockers (need TS 7.1, ~Q4 2026)

TS 7.0 shipped **without a stable programmatic compiler API**. Anything that
imports the compiler API in-process is blocked:

| Blocked                               | Used by                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `typescript-eslint`                   | every workspace, via `@repo/eslint-config`                                                |
| `astro check` + Astro language server | 5 of 7 apps (`content-maker`, `kdebek`, `polubinski-dev`, `romantic-app`, `talent-orbit`) |

Bridge: [`@typescript/typescript6`](https://www.npmjs.com/package/@typescript/typescript6)
re-exports the TS 6.0 API + a `tsc6` binary, so `tsc` can run 7.0 while
API-consumers keep the 6.0 surface.

---

## Workspace readiness

| Workspace                                                   | `check-types`                  | Native-ready now?                                    |
| ----------------------------------------------------------- | ------------------------------ | ---------------------------------------------------- |
| `apps/web`, `apps/docs`                                     | `next typegen && tsc --noEmit` | **Yes** (`tsc --noEmit` part)                        |
| `packages/react-kit`, `ui`                                  | `tsc --noEmit` (+ `tsc` emit)  | **Yes**                                              |
| `packages/type-beast`, `hashy`, `vibe-test`, `astro-config` | `tsc --noEmit` (+ `tsc` emit)  | **Yes** — `hashy` on CI critical path, validate emit |
| 5 Astro apps                                                | `astro check`                  | **No** — needs TS 7.1 API                            |
| `packages/eslint-config`                                    | —                              | **No** — ships `typescript-eslint`                   |

---

## Required config changes (do on TS 6, no behaviour change)

1. **Remove `baseUrl`** from all 5 Astro app `tsconfig.json`. `baseUrl` is
   removed in TS 7; `paths` values are already project-root relative and keep
   resolving relative to the tsconfig dir.
2. **Explicit `"types"`** in every leaf `tsconfig.json` (`type-beast`, `ui` don't
   set it). TS 7 defaults `types` to `[]` instead of auto-including all
   `@types/*`. No-op under TS 6.
3. **`"noUncheckedSideEffectImports": false`** in `base.json`. TS 7 defaults it to
   `true` → bare asset side-effect imports (`import "./x.css"`) without an ambient
   module decl become errors. Remove later as a deliberate cleanup (add
   `declare module "*.css"` per Astro app).

Other TS 7 removals (`module: amd|umd|system`, `moduleResolution: node|classic`,
`target: es5`, `downlevelIteration`, import `assert`, `importsNotUsedAsValues`)
are **not used** here — grep confirms.

`stableTypeOrdering` is always on in TS 7 → `.d.ts` emit from `react-kit` /
`type-beast` / `hashy` / `vibe-test` / `astro-config` may reorder members
(semantically equal). Land regenerated declarations in a dedicated commit and
diff the public surface.

---

## Recommended path — staged, side-by-side

Do **not** do a bare repo-wide bump (breaks `lint` / `ci:verify`).

### Phase 0 — tsconfig hygiene (TS 6)

Apply the 3 config changes above. `pnpm check-types` stays green. Fully
reversible, no deps.

### Phase 1 — native `check-types` for the 8 ready workspaces (shadow)

- Add native compiler as `tsgo` (via `@typescript/native-preview`) devDep to
  `apps/web`, `apps/docs`, `packages/{react-kit,ui,type-beast,hashy,vibe-test,astro-config}`
  - root. Keep `typescript@6.0.3` (ESLint peer).
- Add a **new** Turbo task `check-types:native` running `tsgo --noEmit`; keep the
  classic `check-types`. Run both in CI for 1–2 releases, diff results.

### Phase 2 — cut over

- Replace `check-types` with the native command in those 8; drop the shadow task.
- Switch library `build` to `tsgo`. Validate `hashy` CLI end-to-end
  (`pnpm hash:check` runs the emitted `dist/cli.js`) and `react-kit` / `ui`
  `.d.ts` surface before merge.

### Phase 3 — editor rollout

`.vscode/settings.json` → `"typescript.experimental.useTsgo": true` +
TypeScript (Native Preview) extension. Document: `.astro` files still use the
Astro LS on TS 6; both coexist.

### Phase 4 — Astro apps + ESLint + unify (blocked on TS 7.1)

Start only when TS 7.1 ships the stable API **and** `typescript-eslint` +
`astro check` release native support. Then move the 5 Astro apps, upgrade
`typescript-eslint`, collapse to a single `typescript@7.x` pin, drop the
side-by-side setup.

---

## Rollback

`typescript@6.0.3` stays installed through Phase 3, so rollback is a one-line
script revert per workspace (`tsgo` → `tsc`) + `pnpm install`. No `src` changes
in this migration — nothing to un-migrate. Editor: VS Code "Disable TypeScript
Native Preview".

---

## Conclusion

- **Type-checking and builds are TS-7-ready today** for the 2 Next.js apps and
  all 6 non-Astro packages — verified green in the spike with zero source or
  config changes.
- **Two hard blockers** keep a full migration off the table until **TS 7.1
  (~Q4 2026)**: `typescript-eslint` and `astro check`, both waiting on the stable
  programmatic API.
- **Recommended:** land Phase 0 now (config hygiene, safe on TS 6). Take Phase 1–3
  (side-by-side native `check-types` for the ready 8) whenever the CI-time win is
  worth the dual-toolchain cost. Hold Phase 4 for TS 7.1 + ecosystem support.
- A bare repo-wide bump is **not viable** — it reds `lint` and `ci:verify`.

---

## Effort

| Phase                           | Effort                   | Gate                             |
| ------------------------------- | ------------------------ | -------------------------------- |
| 0 — tsconfig hygiene            | 0.5 day                  | none — can start now             |
| 1 — native `check-types` shadow | 1 day + 1–2 release soak | none                             |
| 2 — cut over + library emit     | 1–1.5 days               | after Phase 1 soak               |
| 3 — editor rollout              | 0.5 day                  | after Phase 2                    |
| 4 — Astro + ESLint + unify      | 1–2 days                 | **blocked on TS 7.1 (~Q4 2026)** |

Total to "as far as we can go today" (Phases 0–3): **~3–4 days + soak time**.

---

## Sources

- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Announcing TypeScript Native Previews](https://devblogs.microsoft.com/typescript/announcing-typescript-native-previews/)
- [`@typescript/native-preview` — npm](https://www.npmjs.com/package/@typescript/native-preview)
- [`@typescript/typescript6` — npm](https://www.npmjs.com/package/@typescript/typescript6)
- [TS 6.0 is the last JavaScript-based major release — Socket](https://socket.dev/blog/typescript-6-0-will-be-the-last-javascript-based-major-release)
- [typescript-eslint TS >=7.1 support tracking — issue #10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)
- [Astro `tsgo` / TS 7 compatibility tracking — withastro/roadmap #1321](https://github.com/withastro/roadmap/discussions/1321)
