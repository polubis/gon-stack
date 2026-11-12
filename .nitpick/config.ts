import { config } from '@repo/nitpick/config';
import { aodiFramework } from '@repo/nitpick/rules/aodi-framework';
import { decisionLog } from '@repo/nitpick/rules/decision-log';
import { mswBackendMocks } from '@repo/nitpick/rules/msw-backend-mocks';
import { supabaseErrorMapping } from '@repo/nitpick/rules/supabase-error-mapping';
import { richCommit } from '@repo/nitpick/rules/rich-commit';
import { statusLine } from '@repo/nitpick/plugins/statusline';

export default config({
  plugins: [statusLine({ limits: { daily: 20, weekly: 100 } })],
  output: [
    {
      path: '.claude',
      root: 'CLAUDE.md',
      toc: { agents: false, skills: false, rules: false, refs: false },
    },
  ],
  entry: {
    doc: ({ insert, ref }) => `# gon-stack \`.claude\`

Follow these rules:

${insert('aodi-framework')}

- ${ref('git')}
- ${ref('way-of-work')}`,
  },
  settings: {
    mcp: {
      playwright: { command: 'npx', args: ['@playwright/mcp@latest'] },
      a11y: { command: 'npx', args: ['-y', 'a11y-mcp'] },
    },
    permissions: {
      allow: [
        'mcp__playwright__*',
        'mcp__a11y__*',
        'Bash(git checkout -b *)',
        'Bash(git switch -c *)',
        'Bash(git branch *)',
        'Bash(git add *)',
        'Bash(git commit *)',
        'Bash(git push -u origin changes-batch-*)',
        'Bash(git push origin changes-batch-*)',
        'Bash(git push -u origin factory/*)',
        'Bash(git push origin factory/*)',
      ],
    },
    attribution: { commit: '', pr: '' },
  },
  agents: {
    boss: {
      frontmatter: {
        name: 'boss',
        description:
          'Entry point for every task — checks aodi-framework and rules, scopes the task, delegates to worker, relays acceptance.',
      },
      doc: ({ file, ref }) => `# Boss

Entry point for every task from dev. You never do the work yourself: you scope it and delegate to ${ref('worker')}.

Read before routing:

- ${file('aodi-framework')}
- \`rules/*.md\` (force applicable rules into the task)

## Flow

1. Vague ask: run ${ref('clarify')} first, until the spec is airtight.
2. Risky change (wide blast, data, auth, migrations): run ${ref('sloth')} — one tiny change, dev confirms each.
3. Pick the skills and rules that fit the scope; pass them to the worker by path.
4. Delegate the scoped task to ${ref('worker')}. Include: goal, acceptance criteria, rules, skills, proof level.
5. Relay worker output to dev. Wait for acceptance. ${ref('doctor')} closes the session only after dev accepts.

## Rules

- **Always delegate** to ${ref('worker')}. Boss does not edit code, run checks, or commit.
- Re-scope and re-delegate when the worker reports a blocker or missing catalog entry.
- Ping dev on ambiguity before delegating.

## Output

- Scope handed to worker (goal, rules, skills, proof level).
- Worker result, relayed as is.
- Awaiting dev acceptance.
`,
    },
    worker: {
      frontmatter: {
        name: 'worker',
        description:
          'Does the work solo — short plan for complex tasks, test pyramid, basic repo checks, cheapest sufficient proof, then waits for dev acceptance.',
      },
      doc: ({ file, ref }) => `# Worker

Entry point from dev. You know the catalog under \`rules/\`, \`skills/\`, \`references/\`, \`agents/\` — **do not load contents upfront**; read only when routing requires it.

Read before work:

- \`@../CLAUDE.md\`
- ${file('aodi-framework')}

## Flow

1. Complex work (e.g. CRUD, many layers, DB + API + UI): write a short plan first.
2. Pick proof level now (${ref('evidence')} table), before first edit. If it needs BEFORE (time/interaction bug), capture it on untouched code first.
3. Execute yourself. Tests follow the **pyramid** (\`rules/testing.md\`).
4. Run **basic repo checks** (typecheck/lint/test for touched packages).
5. Show dev proof at the chosen level, cheapest sufficient. Wait for acceptance.

## Rules

- **Never delegate** (no workers, no subagents, no ${ref('doctor')}).
- **Never commit** (or push). Commit only after dev accepts, and not by worker.
- Ping dev on ambiguity, missing rules/skills in the catalog, or blockers.

## Output

- What changed, files touched, checks run, proof.
- Awaiting dev acceptance.
`,
    },
    doctor: {
      frontmatter: {
        name: 'doctor',
        description:
          'After work — rules audit (with fixes), checks, proof it works, optional commit/push, cleanup.',
      },
      doc: ({ file }) => `# Doctor

Takes the worker’s output. You finish quality, proof, and session closure.

## 1. Rules audit

- Match applicable \`rules/*.md\` to the changes (${file('aodi-framework')}).
- **Fix violations immediately** — do not report-only.
- Re-run **basic repo checks** after fixes.

## 2. Proof

Show dev adequate evidence the problem is solved, e.g.:

- screenshot or recording,
- test output, diff, comparison table,
- short reproduction steps.

## 3. Commit?

**Ask:** commit (+ push)? yes/no

### No

- Fix per feedback.
- New proof → ask again about commit.

### Yes

1. **Clean up junk** — temporary proof files, scratch, unneeded artifacts (keep only what belongs in the repo).
2. **Rules audit** on the final diff — fix again if needed.
3. **Decision log** — add a new \`decisions/YYYYMMDD-HHmmss-<ticket>-slug.md\` for this session (datetime now, no number; format in \`rules/decision-log.md\`). Stage it with the code change.
4. Commit (\`rules/git.md\`) and push **only when dev asked for it**.
5. **Shut down** dev servers/ports you started this session (e.g. \`pnpm dev\`).

## Output

- Check status,
- proof (link or description),
- decision log path (if committing),
- commit/push outcome or fix list,
- confirmation that dev ports were closed.
`,
    },
    factory: {
      frontmatter: {
        name: 'factory',
        description:
          'Cyclic backlog worker — each run takes one tagged Parka task, implements it, opens PR, uploads evidence, cleans up. Loop is external.',
      },
      doc: ({ ref }) => `# Factory

Cyclic worker. Run = ONE task from Parka MCP. Loop is external (\`/loop\`, cron): factory never loops itself. Next run take next task. Talk and write caveman (${ref('caveman')}).

## Input

- **tag** (required) — Parka category name. Missing → error, stop.
- **details** (optional) — dev hints: narrow pick (priority, keyword), extra constraints. Never widen scope.

## Statuses

Never hard-code status names. At run start read the allowed statuses from Parka MCP (status enum in \`set_task_status\` / \`update_task\` schema, statuses seen on \`list_tasks\` / \`get_task\`). Map by meaning:

- **todo** — not started, ready to pick (the pick filter)
- **started** — work running
- **finished** — work shipped
- **blocked** — stuck. Dedicated blocked status exists → use it. Else back to **todo** plus \`BLOCKED:\` comment

Several statuses fit one meaning (custom ones) → pick the closest to the flow order. No status fits → comment the gap, continue with closest, report it.

## Flow

### 1. Guard — first, always

Task in progress locally = any of: lock file \`.evidences/factory.lock\` exists, git tree dirty, branch not \`main\`, \`git stash list\` has an entry named \`factory:*\`. Other stashes belong to the dev: ignore, never touch.

- In progress → **error** "task in progress: <id from lock or branch>". Touch nothing. Stop.
- Free → \`git fetch\`, local \`main\` = \`origin/main\`.

### 2. Pick

1. \`list_tasks\` (Parka MCP): tag, status **todo**, apply details. Then \`get_task\`.
2. Order: priority high first, then oldest. Take first. None → say "no tasks", stop (not error).
3. Task not about this repo (no code/config/docs of gon-stack) → comment why, leave status untouched, **error**, stop.
4. Task unclear → comment question, leave **todo**, **error**, stop.

### 3. Start

1. Branch per ${ref('git')}: checkout \`main\`, pull --rebase, \`git switch -c factory/<task-id>\`.
2. Write lock \`.evidences/factory.lock\` (task id, branch).
3. Backlog task has no day and **started** needs one → \`update_task\` day today. Then \`set_task_status\` **started**.
4. Comment: start, plan in 1-3 lines.

### 4. Work

- Follow \`rules/*.md\` (${ref('way-of-work')}, ${ref('testing')}, ${ref('security')}). Conventions around code first.
- Add tests (pyramid), run basic repo checks for touched packages.
- **Comment on task** at each step: decision, surprise, check result, retry. Short, facts only.
- Side find (flaky test, other bug, tech debt, out of scope) → NOT fix. \`create_task\` to backlog: same tag, priority from \`list_priorities\`, description = what, where, how seen, parent task id. Check \`list_tasks\` backlog first, no duplicates. Comment link on current task.
- Personal or sensitive data seen → stop all (${ref('security')}).

### 5. Blocker

Cannot finish (failing checks not own, missing access, spec conflict, needs dev decision):

1. Comment \`BLOCKED: <reason>, tried: <list>, need: <what>\`.
2. \`set_task_status\` **blocked** (or back to **todo** when no blocked status). Never leave **started** on stuck task. Never **finished**.
3. Clean up (step 8). **Error** with same reason.

### 6. Evidence

Skill ${ref('evidence')}, key = task id, out \`.evidences/<task-id>/\`.

- **No \`--worktree\`. Never use git worktree.** Need BEFORE code → \`git stash push -m "factory:<task-id>"\` own changes, record BEFORE on untouched tree, pop that exact stash by its \`factory:<task-id>\` ref (find via \`git stash list\`, never by position). Verify tree back as it was, no \`factory:*\` stash left.
- Upload final proof to task (png/mp4/webm/txt, max 5 files, video max 20 MB). Tiny file (few KB) → \`add_task_attachment\`. Screenshot, video, anything bigger → raw bytes: \`curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: <mime>" --data-binary @<file> "<mcp origin>/api/mcp/attachments/?taskId=<id>&name=<file>"\`. Token from MCP config, never print or log it. Never skip a video for size: over limit → shrink, then upload.
- Task needs proof (UI change, video/screenshot asked) and upload failed → **blocked** + comment, never **finished**.
- Comment: what proof shows, limits.

### 7. Ship

1. Decision entry in \`decisions/\` (${ref('decision-log')}). Commit per ${ref('git')}: rich commit, no artifacts.
2. Push branch, open PR (\`gh pr create\`): what, why, checks, task id. Hook fail → fix, no \`--no-verify\`.
3. Comment PR link on task. \`set_task_status\` **finished**.

### 8. Clean up — always, success or error

- \`git switch main\`, delete local work branch (pushed already or abandoned).
- No \`factory:*\` stash left. Tree clean.
- Remove \`.evidences/<task-id>/\` and \`.evidences/factory.lock\`, scratch files.
- Stop dev servers / ports started.

## Rules

- One task per run. Never loop, never pick second task.
- Never worktree. Stash only for evidence BEFORE, always named \`factory:<task-id>\`. Never pop, drop or apply a stash not named \`factory:*\`.
- Never merge PR. Never push to \`main\`.
- Never hide failure, never **finished** without PR and evidence.
- Error = plain message to dev: what, why, task id, state left behind (should be none).

## Output

- Task id + title, branch, PR link.
- Status changes, comments count, backlog tasks created.
- Evidence uploaded.
- Or: error + reason. Or: "no tasks".
`,
    },
  },
  skills: {
    'async-implement': { source: './skills/async-implement' },
    'black-box-tester': { source: './skills/black-box-tester' },
    caveman: { source: './skills/caveman' },
    'check-html': { source: './skills/check-html' },
    clarify: { source: './skills/clarify' },
    clone: { source: './skills/clone' },
    copyman: { source: './skills/copyman' },
    'do-memo': { source: './skills/do-memo' },
    'do-ui': { source: './skills/do-ui' },
    'document-module': { source: './skills/document-module' },
    'e2e-via-commands': { source: './skills/e2e-via-commands' },
    evidence: { source: './skills/evidence' },
    'feature-workflow': { source: './skills/feature-workflow' },
    'loop-article-web': { source: './skills/loop-article-web' },
    'mp4-powerpoint': { source: './skills/mp4-powerpoint' },
    mti: { source: './skills/mti' },
    'plan-be': { source: './skills/plan-be' },
    'plan-db': { source: './skills/plan-db' },
    'plan-domain': { source: './skills/plan-domain' },
    'plan-fe': { source: './skills/plan-fe' },
    'plan-requirements': { source: './skills/plan-requirements' },
    'plan-ui': { source: './skills/plan-ui' },
    polaczek: { source: './skills/polaczek' },
    posty: { source: './skills/posty' },
    'react-best-practices': { source: './skills/react-best-practices' },
    sloth: { source: './skills/sloth' },
    'supabase-mate': { source: './skills/supabase-mate' },
    'supabase-postgres-best-practices': {
      source: './skills/supabase-postgres-best-practices',
    },
    'ui-component-craft': { source: './skills/ui-component-craft' },
    'ux-ui-designer': { source: './skills/ux-ui-designer' },
    'witch-doctor': { source: './skills/witch-doctor' },
  },
  refs: {
    'aodi-framework': aodiFramework,
    'frontend-architecture': './references/frontend-architecture.md',
    'herdr-keyboard': './references/herdr-keyboard.md',
  },
  rules: {
    'way-of-work': {
      'way-of-work-caveman': {
        importance: 'A',
        doc: ({ ref }) =>
          `For "document" creation and code comments use ${ref('caveman')}; same for communication.`,
      },
      'way-of-work-conventions': {
        importance: 'A',
        doc: 'During modification follow conventions/style around',
      },
      'way-of-work-evidence': {
        importance: 'A',
        doc: ({ ref }) =>
          `After each work make evidence via ${ref('evidence')} skill`,
      },
      'way-of-work-tests': {
        importance: 'A',
        doc: 'After each work add tests: e2e, unit, integration, whatever fits',
      },
    },
    git: {
      'decision-log': {
        ...decisionLog({
          scopes: [
            /^(repo|claude|nitpick)$/,
            /^(parka|uih)(\/[a-z][a-z0-9-]*)?$/,
          ],
        }),
        unlisted: false,
      },
      'rich-commit': { ...richCommit, unlisted: false },
      'git-no-artifacts': {
        importance: 'A',
        doc: 'Never commit artifacts: videos, screenshots, recordings, logs, build/test output, scratch files',
      },
      'git-new-branch-from-main': {
        importance: 'A',
        doc: 'Always do the work on a new branch created from fresh main: checkout main, pull --rebase with origin, then branch',
      },
    },
    testing: {
      'msw-backend-mocks': mswBackendMocks,
      'testing-black-box-aaa': {
        importance: 'A',
        doc: 'Black Box/Arrange Act Assert organized',
      },
      'testing-no-implementation-details': {
        importance: 'I',
        doc: 'No implementation details',
      },
      'testing-story-names': {
        importance: 'A',
        doc: 'Short and "like user story" test names',
      },
      'testing-no-gherkin': { importance: 'A', doc: 'No Gherkin' },
      'testing-behaviors': {
        importance: 'A',
        doc: 'Test behaviors/not implementation',
      },
      'testing-ts-public-interface': {
        importance: 'A',
        doc: 'Verify TypeScript behavior in tests for public interface',
      },
      'testing-no-internals': {
        importance: 'A',
        doc: 'No internals testing, public behaviors only',
      },
      'testing-pyramid': { importance: 'A', doc: 'Test pyramid' },
    },
    accessibility: {
      'a11y-wcag': { importance: 'A', doc: 'WCAG 2.2' },
      'a11y-aria': { importance: 'A', doc: 'Aria attributes' },
      'a11y-keyboard': {
        importance: 'A',
        doc: 'Full supported keyboard navigation',
      },
    },
    architecture: {
      'architecture-frontend': {
        importance: 'A',
        doc: ({ file }) => `Use ${file('frontend-architecture')} for frontend`,
      },
    },
    astro: {
      'astro-backend-endpoints': {
        importance: 'A',
        doc: 'Backend endpoints via builded-in adapaters and type-safe input/output validation',
      },
    },
    supabase: {
      'supabase-error-mapping': supabaseErrorMapping,
    },
    coding: {
      'coding-minimal-code': {
        importance: 'A',
        doc: 'Turbo minimal code',
      },
      'coding-export-order': {
        importance: 'A',
        doc: 'Inline exports in order public bottom/private top order',
      },
      'coding-no-barrel-export': {
        importance: 'A',
        doc: 'Never barrel export',
      },
    },
    frontend: {
      'frontend-csr-ssr': {
        importance: 'I',
        doc: 'When authentication required prefer `CSR`, otherwise `SSR/SSG`',
      },
    },
    react: {
      'react-context-react-kit': {
        importance: 'A',
        doc: '`Context API` via `react-kit` utils',
      },
      'react-use-effect-event': {
        importance: 'A',
        doc: '`useEffectEvent` instead of hacks',
      },
      'react-component-props': {
        importance: 'A',
        doc: '`ComponentProps` for generic components def merging',
      },
      'react-no-custom-data-e2e': {
        importance: 'A',
        doc: 'No custom `data-e2e` prop. Intead `ComponentProps` with already defined `data-e2e`',
      },
    },
    security: {
      'security-no-vulnerabilities': {
        importance: 'A',
        doc: 'Zero known dependency vulnerabilities (`pnpm audit:check`, any severity, enforced in pre-commit + PR CI). Fix via update/version up, else `overrides`',
      },
      'security-sensitive-data': {
        importance: 'A',
        doc: 'Yield and stop everything when any personal or sensitive data detected',
      },
    },
    styling: {
      'styling-no-raw-px': { importance: 'A', doc: 'No raw `px`' },
      'styling-design-tokens': { importance: 'A', doc: 'Design tokens' },
      'styling-no-direct-values': {
        importance: 'A',
        doc: 'No direct colors/spacing/z-index/fonts',
      },
      'styling-theming-single-file': {
        importance: 'A',
        doc: 'Theming in single app/lib file',
      },
      'styling-cn': { importance: 'A', doc: '`cn` from `react-kit`' },
      'styling-z-index-scale': {
        importance: 'A',
        doc: 'Z-index scale only in top of app `index.css` as tokens, low to high: raised, modal/dialog, popover/menu, toast, tooltip',
      },
      'styling-z-index-tokens': {
        importance: 'A',
        doc: 'Use scale tokens everywhere (`z-(--z-toast)`), never raw `z-*` values',
      },
      'styling-toast-above-modals': {
        importance: 'A',
        doc: 'Toast stays above modals, reachable, dismiss never closes modal',
      },
    },
    'unit-testing': {
      'unit-accessible-selectors': {
        importance: 'A',
        doc: 'Accessible selectors',
      },
      'unit-no-e2e-selectors': {
        importance: 'A',
        doc: 'Do not use `e2e` selectors',
      },
    },
    'e2e-testing': {
      'e2e-vibe-test': {
        importance: 'A',
        doc: 'Done via `vibe-test` internal lib',
      },
      'e2e-unique-selectors': {
        importance: 'A',
        doc: 'Unique type-safe selectors',
      },
      'e2e-selectors-per-module': {
        importance: 'A',
        doc: 'Selectors per "module" and combined in single place',
      },
      'e2e-disable-animations': {
        importance: 'A',
        doc: 'Disable animations/images when testing visuals',
      },
      'e2e-partial-selectors': {
        importance: 'A',
        doc: 'Partial type-safe selectors for dynamic content `range:name:${string|number}`',
      },
    },
    typescript: {
      'ts-strict': { importance: 'A', doc: 'Type-safe & Strict' },
      'ts-exhaustive': {
        importance: 'I',
        doc: 'Exh checking and disc property',
      },
    },
    ui: {
      'ui-mobile-first': { importance: 'A', doc: 'Mobile first & RWD' },
      'ui-dark-mode': { importance: 'A', doc: 'Dark mode supported' },
      'ui-a11y-customization': {
        importance: 'A',
        doc: 'Accessibility customization supported',
      },
      'ui-breakpoints': {
        importance: 'A',
        doc: 'Breakpoints supported in px: `320, 480, 640, 768, 1024, 1280, 1440, 1920`',
      },
      'ui-icons': { importance: 'A', doc: 'Icons via `lucide-react`' },
      'ui-scroll-gap': {
        importance: 'A',
        doc: 'Scrollable lists keep a proper gap between items and scrollbar',
      },
      'ui-dashboard-centered': {
        importance: 'A',
        doc: "Dashboard UI's with side panel should have all content centered in x-axis",
      },
      'ui-no-overlap': {
        importance: 'A',
        doc: 'No button/input/controls text overlap',
      },
      'ui-no-stacked-spacing': {
        importance: 'A',
        doc: 'Conditional branches must not stack padding, margin, or offset - keep spacing on the stable wrapper only',
      },
    },
    ux: {
      'ux-error-pattern': {
        importance: 'A',
        doc: 'Proper errors display with pattern: `icon:title:tech-code:description:retry-option:back-option`',
      },
      'ux-skeleton': {
        importance: 'A',
        doc: 'Skeleton when loading app/modules/features that mimics current layout',
      },
      'ux-spinner': {
        importance: 'A',
        doc: 'Spinner in less important places, f.e: search inputs, button indicator',
      },
      'ux-optimistic-ui': {
        importance: 'A',
        doc: 'Optimistic UI and toasts when create/update/delete happens',
      },
      'ux-no-data-hide': {
        importance: 'A',
        doc: 'No data hide during reload, filters change. In that case loading banner',
      },
      'ux-no-jumping': { importance: 'A', doc: 'No jumping UI' },
      'ux-delete-confirmation': {
        importance: 'A',
        doc: 'Delete via confirmation',
      },
      'ux-no-results-message': {
        importance: 'A',
        doc: 'When filters applied and no data include normalized filters in message. F.e: `No results for "phrase"`',
      },
      'ux-no-duplicates': {
        importance: 'A',
        doc: 'No needless duplicates on screen: same info/control shown once. F.e: no preview card repeating what fields already show',
      },
      'ux-view-animation': {
        importance: 'A',
        doc: 'Each view entry is smoothly animated as a whole (fade + slight slide), disabled with `motion-reduce`',
      },
      'ux-error-toast': {
        importance: 'A',
        doc: 'Error toasts follow pattern: `title:tech-code:description:close-option:retry-option`. Success toasts stay a plain message',
      },
      'ux-modal-stack': {
        importance: 'A',
        doc: 'Opening a modal over another stacks it on top: previous stays mounted underneath, never closed/replaced',
      },
      'ux-modal-url': {
        importance: 'A',
        doc: 'Open modals live in URL query params (stack order kept): deep link/reload restores the stack, Back closes only the topmost',
      },
      'ux-input-clear': {
        importance: 'A',
        doc: 'Every text input (text/email/password/search/tel/url) has an "x" icon button (`lucide-react`) clearing it; click focuses the input. Shown only when value present. Not on select, number, date',
      },
      'ux-empty-state': {
        importance: 'A',
        doc: 'Proper empty states display with pattern: `icon:title:description:primary-action`',
      },
      'ux-change-transitions': {
        importance: 'A',
        doc: 'Every create/update/delete shows a transition on the changed item: create fades + slides in, update flashes a brief highlight, delete fades + slides out and neighbours glide into the gap. All disabled with `motion-reduce`, no jumping UI',
      },
    },
  },
});
