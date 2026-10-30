import { config } from '@repo/nitpick/config';
import { aodiFramework } from '@repo/nitpick/rules/aodi-framework';
import { decisionLog } from '@repo/nitpick/rules/decision-log';
import { mswBackendMocks } from '@repo/nitpick/rules/msw-backend-mocks';
import { richCommit } from '@repo/nitpick/rules/rich-commit';

const SKILLS = [
  ['caveman', 'Cut fluff ~75%; keep tech exact', 'Markdown / `/caveman`'],
  ['clarify', 'Vague ask → airtight spec', 'Req unclear'],
  ['sloth', 'One tiny change + confirm', '`/sloth`, risky blast'],
  ['plan-requirements', 'Raw → standard feature.md', 'Plan requirements'],
  ['ux-ui-designer', 'MVP → `ux-ui.md`', 'Design tokens/views'],
  ['plan-ui', 'Graphic → element list (no code)', 'Analyse mockup'],
  ['plan-db', 'Schema + indexes/security/migrations', 'Design DB'],
  ['plan-be', 'REST/RPC + Zod in/out', 'Plan APIs'],
  ['plan-domain', 'Pure TS domain types + events', 'Domain layer'],
  ['plan-fe', 'Views/core/integration plan', 'FE architecture'],
  ['supabase-mate', 'Supabase design + approval gates', 'Schema/RLS/RPC'],
  ['feature-workflow', 'Orchestrate plan → impl skills', 'Full epic'],
  ['clone', 'Impl in ideal-example style', '"clone X, build Y"'],
  ['do-ui', 'Graphic → pixel-perfect Tailwind', 'Pixel-perfect UI'],
  ['document-module', 'Module → `AGENTS.md`', 'Ideal-example docs'],
  [
    'async-implement',
    'TODO.md → parallel worktree agents',
    'Multi-task parallel',
  ],
  ['ui-component-craft', 'Req gate → pure UI components', 'Craft components'],
  [
    'react-best-practices',
    'React/Tailwind/Radix rules',
    'Write/review React UI',
  ],
  [
    'supabase-postgres-best-practices',
    'Postgres perf rules',
    'SQL/schema tune',
  ],
  [
    'black-box-tester',
    'Plan → black-box tests only',
    'Tests from requirements',
  ],
  ['e2e-via-commands', 'E2E via step interpreter', 'Extend e2e path'],
  ['check-html', 'a11y audit HTML/URL', 'Check accessibility'],
  ['witch-doctor', 'Score module quality', 'Audit/review codebase'],
  [
    'evidence',
    'Cheapest proof: test/shot/video/responsive board + `evidence.mjs`',
    'Proof of change',
  ],
  ['copyman', 'Landing/pricing conversion copy', 'Marketing copy'],
  ['posty', 'Batch polish posts (`---` split)', 'Post grammar/typo'],
  ['polaczek', 'Polish lang + typography', 'Polish text fix'],
  ['loop-article-web', 'One lang template per run', 'Article loop'],
  ['do-memo', 'Concept → use case → example', 'Flashcard / memo'],
  ['mti', 'Interview notes → scored report', 'Tech interview write-up'],
  [
    'mp4-powerpoint',
    'Animated LinkedIn explainer video (MP4)',
    'LinkedIn video/slides',
  ],
] as const;

export default config({
  output: [{ path: '.claude', root: 'CLAUDE.md' }],
  entry: {
    doc: ({ file, ref }) => `# gon-stack \`.claude\`

This file + \`rules/\`, \`skills/\`, \`references/\` guide agents in **gon-stack**.

## Prerequisites

Always check ${file('aodi-framework')} and \`rules/*.md\` before any task and force rules.

Every task starts by delegating to the ${ref('worker')} agent. \`worker\` never delegates and never commits: it does the work, shows proof, and waits for dev acceptance. Commit only after acceptance.

Use ${ref('caveman')} for any markdown (\`rules/general.md\`), ${ref('clarify')} when the ask is vague, ${ref('sloth')} for risky changes.

## Ecosystem

\`\`\`md
\`rules/\` -> rules to apply during work
\`skills/\` -> skills
\`references/\` -> knowledge
\`agents/\` -> agent personas
\`\`\`

### Agents

| Agent | What |
| ----- | ---- |
| ${ref('worker')} | Does the work solo: plan if complex, tests, checks, cheapest proof, wait for acceptance |
| ${ref('doctor')} | Rules audit (fix), proof, commit?, cleanup, close dev ports |

### Skills

| Skill | Does | When |
| ----- | ---- | ---- |
${SKILLS.map(([id, does, when]) => `| ${ref(id)} | ${does} | ${when} |`).join('\n')}`,
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
      ],
    },
    attribution: { commit: '', pr: '' },
  },
  agents: {
    worker: {
      frontmatter: {
        name: 'worker',
        description:
          'Does the work solo — short plan for complex tasks, test pyramid, basic repo checks, cheapest sufficient proof, then waits for dev acceptance.',
      },
      doc: { file: './agents/worker.md' },
    },
    doctor: {
      frontmatter: {
        name: 'doctor',
        description:
          'After work — rules audit (with fixes), checks, proof it works, optional commit/push, cleanup.',
      },
      doc: { file: './agents/doctor.md' },
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
    git: {
      'rich-commit': richCommit,
      'git-no-artifacts': {
        importance: 'A',
        doc: 'Never commit artifacts: videos, screenshots, recordings, logs, build/test output, scratch files',
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
    general: {
      'decision-log': decisionLog({
        scopes: [
          /^(repo|claude|nitpick)$/,
          /^(parka|uih)(\/[a-z][a-z0-9-]*)?$/,
        ],
      }),
      'general-minimal-text': {
        importance: 'A',
        doc: 'Turbo minimal text',
      },
      'general-prefer-ascii': { importance: 'I', doc: 'Prefer ASCI' },
      'general-caveman-markdown': {
        importance: 'A',
        doc: 'Use `/caveman full` skill to reduce text inside any `markdown`',
      },
      'general-follow-conventions': {
        importance: 'A',
        doc: 'During modification follow conventions/style around',
      },
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
    },
  },
});
