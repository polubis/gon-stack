<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <img alt="gon-stack: Astro + React apps on Cloudflare Workers, built with AI agents under machine-checked rules" src="assets/banner.svg" width="100%">
</picture>

<a href="https://github.com/polubis"><img src="assets/avatar.png" alt="Adrian Połubiński" width="96" height="96"></a>

<sub>Built by <a href="https://github.com/polubis"><b>Adrian Połubiński</b></a> · <a href="https://polubinski.dev">polubinski.dev</a></sub>

**Turborepo monorepo for shipping Astro + React apps on Cloudflare Workers, built with AI agents under strict, machine-checked rules.**

[![License: MIT](https://img.shields.io/badge/license-MIT-0bad67?style=flat-square)](LICENSE)
[![Node 24](https://img.shields.io/badge/node-24.22.1-0bad67?style=flat-square&logo=nodedotjs&logoColor=white)](.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-11.28.5-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io)
[![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://workers.cloudflare.com)
[![PR CI](https://github.com/polubis/gon-stack/actions/workflows/pr-ci.yml/badge.svg)](https://github.com/polubis/gon-stack/actions/workflows/pr-ci.yml)

[Template + sandbox](#-template-and-sandbox) •
[Quick Start](#-quick-start) •
[Apps](#-apps) •
[Packages](#-packages) •
[How we work](#-how-we-work) •
[Agent skills](#-agent-skills-and-rules) •
[Structure](#-project-structure) •
[Contributing](#-contributing)

</div>

---

## 🧩 Template and sandbox

gon-stack is **both a template and a sandbox**.

- **Template.** Clone it and get ready-made Astro + React apps, shared packages, CI and Cloudflare Workers deploys wired up.
- **Sandbox.** Real products are built here, so every rule, skill and tool is tested on live code, not on toy examples.
- **Real production apps.** `parka`, `kdebek` and `polubinski-dev` deploy to Cloudflare Workers from `main` via GitHub Actions. `polubinski-dev` serves [polubinski.dev](https://polubinski.dev).
- **AI ecosystem and tooling.** Agents work with the same gates as humans:

| Piece     | Where                     | What it gives                                                    |
| --------- | ------------------------- | ---------------------------------------------------------------- |
| Rules     | `.claude/rules/`          | Tagged, always-on standards (TypeScript, a11y, UX, styling, git) |
| Skills    | `.claude/skills/`         | Reusable workflows: planning, testing, evidence, reviews         |
| Agents    | `.claude/agents/`         | `boss`, `worker`, `doctor` roles                                 |
| nitpick   | `packages/nitpick`        | Keeps rule docs in sync with code, runs project checks           |
| vibe-test | `packages/vibe-test`      | E2E lib with type-safe selectors                                 |
| evidence  | `.claude/skills/evidence` | Proof videos and screenshots per task                            |
| decisions | `decisions/`              | One decision entry per session                                   |

---

## 🔁 Workflow

```mermaid
flowchart LR
  T["Task<br/>VYB-245"] --> P["Plan<br/>.claude/rules + AODI"]
  P --> B["Build<br/>agents + humans"]
  B --> V["Verify<br/>pnpm ci:verify"]
  V --> E["Evidence<br/>.evidences/KEY"]
  E --> D["Decision<br/>decisions/"]
  D --> S["Ship<br/>GH Actions to Cloudflare Workers"]
```

---

## 🚀 Quick Start

Requires Node `24.22.1` (see `.nvmrc`) and pnpm `11.28.5`.

```bash
pnpm install
pnpm dev                          # all apps via turbo
pnpm --filter parka dev           # one app, http://localhost:4321
```

| What you're doing | Command                            | Key principle                 |
| ----------------- | ---------------------------------- | ----------------------------- |
| Run everything    | `pnpm dev`                         | One command, all apps         |
| Unit tests        | `pnpm test`                        | Behavior, not internals       |
| E2E tests         | `pnpm pw:install && pnpm test:e2e` | Runs against the built worker |
| Lint + types      | `pnpm lint && pnpm check-types`    | Strict TypeScript             |
| Full CI locally   | `pnpm ci:verify`                   | Same gate as the PR           |
| Rules in sync     | `pnpm nitpick:check`               | Docs match code               |
| Format            | `pnpm format`                      | Prettier + Tailwind plugin    |

<details>
<summary><b>Supabase apps (Docker needed)</b></summary>

<br>

Apps with Supabase (`parka`, `romantic-app`, `talent-orbit`) need Docker:

```bash
pnpm db:start        # Postgres + Auth + Studio
pnpm db:reset        # apply migrations
pnpm db:gen-types    # regenerate DB types
```

Copy `.env.example` and `.dev.vars.example` where an app ships them (see `apps/parka/README.md`).

</details>

---

## 📦 Apps

| App                                     | What it is                                                                            | Stack                           | Deployed |
| --------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------- | :------: |
| [`parka`](apps/parka)                   | Personal finance and tasks: expenses, categories, reports, access tokens, data export | Astro, React, Supabase, Workers |    ✅    |
| [`polubinski-dev`](apps/polubinski-dev) | IT mentoring website, [polubinski.dev](https://polubinski.dev)                        | Astro, React, Workers           |    ✅    |
| [`kdebek`](apps/kdebek)                 | Home + privacy policy site                                                            | Astro, React, Workers           |    ✅    |
| [`talent-orbit`](apps/talent-orbit)     | Tests, exams, questions library, roles, organizations                                 | Astro, React, Supabase, Workers |          |
| [`romantic-app`](apps/romantic-app)     | Amoria: landing, auth, profile setup, chat, design system                             | Astro, React, Supabase, Workers |          |
| [`content-maker`](apps/content-maker)   | Content creation tool                                                                 | Astro, React, Workers           |          |
| [`uih-docs`](apps/uih-docs)             | Docs for `@repo/uih`                                                                  | Astro, MDX                      |          |
| [`docs`](apps/docs), [`web`](apps/web)  | Turborepo starter apps                                                                | Next.js                         |          |

✅ = deployed to Cloudflare Workers by `.github/workflows/deploy-*.yml`.

---

## 🧱 Packages

| Package                                                 | Purpose                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| [`@repo/uih`](packages/uih)                             | Headless React UI, parts API (`Button.Root`), native element first |
| [`@repo/paker`](packages/paker)                         | Tiny state manager, zero runtime deps, subpath imports             |
| [`@repo/react-kit`](packages/react-kit)                 | React utils: `cn`, Context API helpers                             |
| [`@repo/type-beast`](packages/type-beast)               | Shared TypeScript types                                            |
| [`@repo/vibe-test`](packages/vibe-test)                 | Internal e2e lib, type-safe selectors                              |
| [`@repo/nitpick`](packages/nitpick)                     | Keeps AI rule docs (AODI) in sync with code, runs project checks   |
| [`@repo/ui`](packages/ui)                               | Shared component library                                           |
| [`@repo/astro-config`](packages/astro-config)           | Shared Astro config                                                |
| [`@repo/tailwind-config`](packages/tailwind-config)     | Shared Tailwind styles and tokens                                  |
| [`@repo/eslint-config`](packages/eslint-config)         | Shared ESLint configs                                              |
| [`@repo/typescript-config`](packages/typescript-config) | Shared `tsconfig` bases                                            |

---

## 🛠️ How we work

1. **Tracker key first.** Every change maps to a task (`VYB-245`) used in commits, decisions and evidence.
2. **Rules are code.** `.claude/rules/` holds tagged rules: `A` always, `I` infer, `O` optional, `D` on request. `nitpick` checks them.
3. **Rich commits.** `type(scope): title`, blank line, `- ` change list. Scope is required, `!` marks a breaking change.
4. **One decision per session.** A new file in `decisions/YYYYMMDD-HHmmss-<ticket>-<slug>.md` records what changed and why.
5. **Proof, not claims.** Cheapest sufficient evidence (test, screenshot, video) saved under `.evidences/<KEY>/`, never committed.
6. **CI gate.** `ci:verify` runs format, lint, types, unit tests, build, then e2e. Husky runs it before commit.

---

## 🤖 Agent skills and rules

`.claude/` is the agent workspace.

| Path                  | Contents                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `.claude/CLAUDE.md`   | Entry point, rule index                                                                     |
| `.claude/rules/`      | Git, testing, UX, UI, a11y, security, styling, TypeScript, React, Astro, Supabase           |
| `.claude/references/` | AODI framework, frontend architecture                                                       |
| `.claude/skills/`     | Reusable workflows: `evidence`, `plan-*`, `black-box-tester`, `sloth`, `witch-doctor`, more |
| `.claude/agents/`     | `boss`, `worker`, `doctor` roles                                                            |

<details>
<summary><b>Rule highlights</b></summary>

<br>

- Strict TypeScript
- Design tokens, no raw `px` or colors
- WCAG 2.2, full keyboard navigation
- Mobile first, dark mode
- No barrel exports
- `msw` for backend mocks
- Every Supabase error through `fromSupabaseError`

</details>

---

## 🗂️ Project structure

```
apps/        deployable apps (Astro + Workers, two Next.js starters)
packages/    shared libraries and configs
decisions/   one decision entry per session
scripts/     repo tooling
assets/      README brand assets
.claude/     rules, skills, agents, references
.nitpick/    rule sync config
.github/     PR CI and deploy workflows
```

Typical app layout: `src/core`, `src/modules/<feature>`, `src/pages`, `src/__e2e__`.

---

## ⚙️ Tech stack

Turborepo, pnpm workspaces, Astro, React, TypeScript, Tailwind CSS, Supabase (Postgres, Auth, RLS), Cloudflare Workers, Zod, RxJS, Vitest, Playwright, MSW, ESLint, Prettier, Husky.

---

## 🤝 Contributing

Create a branch from `main`, keep changes minimal, follow nearby conventions, run `pnpm ci:verify`, add one decision entry, open a PR. CI must pass.

---

## 👤 Author

Created and maintained by **Adrian Połubiński** ([@polubis](https://github.com/polubis), [polubinski.dev](https://polubinski.dev)).

<a href="https://greenonsoftware.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/greenon-logo-dark.svg">
    <img alt="GreenOn Software" src="assets/greenon-logo.svg" width="220">
  </picture>
</a>

---

## 📄 License

[MIT](LICENSE) © 2026 Adrian Połubiński. Free to use, copy, modify and distribute.

<div align="center">
<br>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
  <img alt="gon-stack" src="assets/logo.svg" width="180">
</picture>
</div>
