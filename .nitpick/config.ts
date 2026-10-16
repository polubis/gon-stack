import { config } from '@repo/nitpick/config';
import type { Importance, Rule } from '@repo/nitpick/config';
import { decisionLog } from '@repo/nitpick/rules/decision-log';
import { mswBackendMocks } from '@repo/nitpick/rules/msw-backend-mocks';
import { richCommit } from '@repo/nitpick/rules/rich-commit';

type Entry = [id: string, importance: Importance, text: string];

const group = (name: string, entries: Entry[]): Rule[] =>
  entries.map(([id, importance, text]) => ({
    id,
    group: name,
    importance,
    instruction: () => text,
  }));

const rules: Rule[] = [
  ...group('accessibility', [
    ['a11y-wcag', 'A', 'WCAG 2.2'],
    ['a11y-aria', 'A', 'Aria attributes'],
    ['a11y-keyboard', 'A', 'Full supported keyboard navigation'],
  ]),
  {
    id: 'architecture-frontend',
    group: 'architecture',
    importance: 'A',
    instruction: ({ ref }) =>
      `Use ${ref('frontend-architecture')} for frontend`,
  },
  ...group('astro', [
    [
      'astro-backend-endpoints',
      'A',
      'Backend endpoints via builded-in adapaters and type-safe input/output validation',
    ],
  ]),
  ...group('coding', [
    ['coding-minimal-code', 'A', 'Turbo minimal code'],
    [
      'coding-export-order',
      'A',
      'Inline exports in order public bottom/private top order',
    ],
    ['coding-no-barrel-export', 'A', 'Never barrel export'],
  ]),
  ...group('frontend', [
    [
      'frontend-csr-ssr',
      'I',
      'When authentication required prefer `CSR`, otherwise `SSR/SSG`',
    ],
  ]),
  ...group('general', [
    ['general-minimal-text', 'A', 'Turbo minimal text'],
    ['general-prefer-ascii', 'I', 'Prefer ASCI'],
    [
      'general-caveman-markdown',
      'A',
      'Use `/caveman full` skill to reduce text inside any `markdown`',
    ],
    [
      'general-follow-conventions',
      'A',
      'During modification follow conventions/style around',
    ],
  ]),
  ...group('git', [
    [
      'git-no-artifacts',
      'A',
      'Never commit artifacts: videos, screenshots, recordings, logs, build/test output, scratch files',
    ],
  ]),
  ...group('react', [
    ['react-context-react-kit', 'A', '`Context API` via `react-kit` utils'],
    ['react-use-effect-event', 'A', '`useEffectEvent` instead of hacks'],
    [
      'react-component-props',
      'A',
      '`ComponentProps` for generic components def merging',
    ],
    [
      'react-no-custom-data-e2e',
      'A',
      'No custom `data-e2e` prop. Intead `ComponentProps` with already defined `data-e2e`',
    ],
  ]),
  ...group('security', [
    [
      'security-sensitive-data',
      'A',
      'Yield and stop everything when any personal or sensitive data detected',
    ],
  ]),
  ...group('styling', [
    ['styling-no-raw-px', 'A', 'No raw `px`'],
    ['styling-design-tokens', 'A', 'Design tokens'],
    ['styling-no-direct-values', 'A', 'No direct colors/spacing/z-index/fonts'],
    ['styling-theming-single-file', 'A', 'Theming in single app/lib file'],
    ['styling-cn', 'A', '`cn` from `react-kit`'],
  ]),
  ...group('testing', [
    ['testing-black-box-aaa', 'A', 'Black Box/Arrange Act Assert organized'],
    ['testing-no-implementation-details', 'I', 'No implementation details'],
    ['testing-story-names', 'A', 'Short and "like user story" test names'],
    ['testing-no-gherkin', 'A', 'No Gherkin'],
    ['testing-behaviors', 'A', 'Test behaviors/not implementation'],
    [
      'testing-ts-public-interface',
      'A',
      'Verify TypeScript behavior in tests for public interface',
    ],
    [
      'testing-no-internals',
      'A',
      'No internals testing, public behaviors only',
    ],
    ['testing-pyramid', 'A', 'Test pyramid'],
  ]),
  ...group('unit-testing', [
    ['unit-accessible-selectors', 'A', 'Accessible selectors'],
    ['unit-no-e2e-selectors', 'A', 'Do not use `e2e` selectors'],
  ]),
  ...group('e2e-testing', [
    ['e2e-vibe-test', 'A', 'Done via `vibe-test` internal lib'],
    ['e2e-unique-selectors', 'A', 'Unique type-safe selectors'],
    [
      'e2e-selectors-per-module',
      'A',
      'Selectors per "module" and combined in single place',
    ],
    [
      'e2e-disable-animations',
      'A',
      'Disable animations/images when testing visuals',
    ],
    [
      'e2e-partial-selectors',
      'A',
      'Partial type-safe selectors for dynamic content `range:name:${string|number}`',
    ],
  ]),
  ...group('typescript', [
    ['ts-strict', 'A', 'Type-safe & Strict'],
    ['ts-exhaustive', 'I', 'Exh checking and disc property'],
  ]),
  ...group('ui', [
    ['ui-mobile-first', 'A', 'Mobile first & RWD'],
    ['ui-dark-mode', 'A', 'Dark mode supported'],
    ['ui-a11y-customization', 'A', 'Accessibility customization supported'],
    [
      'ui-breakpoints',
      'A',
      'Breakpoints supported in px: `320, 480, 640, 768, 1024, 1280, 1440, 1920`',
    ],
    ['ui-icons', 'A', 'Icons via `lucide-react`'],
    [
      'ui-scroll-gap',
      'A',
      'Scrollable lists keep a proper gap between items and scrollbar',
    ],
    [
      'ui-dashboard-centered',
      'A',
      "Dashboard UI's with side panel should have all content centered in x-axis",
    ],
    ['ui-no-overlap', 'A', 'No button/input/controls text overlap'],
    [
      'ui-no-stacked-spacing',
      'A',
      'Conditional branches must not stack padding, margin, or offset - keep spacing on the stable wrapper only',
    ],
  ]),
  ...group('ux', [
    [
      'ux-error-pattern',
      'A',
      'Proper errors display with pattern: `icon:title:tech-code:description:retry-option:back-option`',
    ],
    [
      'ux-skeleton',
      'A',
      'Skeleton when loading app/modules/features that mimics current layout',
    ],
    [
      'ux-spinner',
      'A',
      'Spinner in less important places, f.e: search inputs, button indicator',
    ],
    [
      'ux-optimistic-ui',
      'A',
      'Optimistic UI and toasts when create/update/delete happens',
    ],
    [
      'ux-no-data-hide',
      'A',
      'No data hide during reload, filters change. In that case loading banner',
    ],
    ['ux-no-jumping', 'A', 'No jumping UI'],
    ['ux-delete-confirmation', 'A', 'Delete via confirmation'],
    [
      'ux-no-results-message',
      'A',
      'When filters applied and no data include normalized filters in message. F.e: `No results for "phrase"`',
    ],
    [
      'ux-no-duplicates',
      'A',
      'No needless duplicates on screen: same info/control shown once. F.e: no preview card repeating what fields already show',
    ],
    [
      'ux-view-animation',
      'A',
      'Each view entry is smoothly animated as a whole (fade + slight slide), disabled with `motion-reduce`',
    ],
    [
      'ux-error-toast',
      'A',
      'Error toasts follow pattern: `title:tech-code:description:close-option:retry-option`. Success toasts stay a plain message',
    ],
    [
      'ux-modal-stack',
      'A',
      'Opening a modal over another stacks it on top: previous stays mounted underneath, never closed/replaced',
    ],
    [
      'ux-modal-url',
      'A',
      'Open modals live in URL query params (stack order kept): deep link/reload restores the stack, Back closes only the topmost',
    ],
    [
      'ux-input-clear',
      'A',
      'Every text input (text/email/password/search/tel/url) has an "x" icon button (`lucide-react`) clearing it; click focuses the input. Shown only when value present. Not on select, number, date',
    ],
    [
      'ux-empty-state',
      'A',
      'Proper empty states display with pattern: `icon:title:description:primary-action`',
    ],
  ]),
];

export default config({
  docs: {
    header: 'Project rules for AI agents',
    intro: () =>
      'Generated by nitpick from `.nitpick/config.ts`. Do not edit by hand.',
    groups: {
      astro: { title: 'Astro' },
      typescript: { title: 'TypeScript' },
      ui: { title: 'UI' },
      ux: { title: 'UX' },
      'unit-testing': { title: 'Unit/Integration' },
      'e2e-testing': { title: 'E2E' },
    },
  },
  settings: {
    mcp: {
      playwright: { command: 'npx', args: ['@playwright/mcp@latest'] },
      a11y: { command: 'npx', args: ['-y', 'a11y-mcp'] },
    },
    permissions: { allow: ['mcp__playwright__*', 'mcp__a11y__*'] },
    attribution: { commit: '', pr: '' },
  },
  knowledge: {
    refs: {
      'frontend-architecture': './references/frontend-architecture.md',
      'herdr-keyboard': './references/herdr-keyboard.md',
    },
  },
  rules: [
    richCommit,
    mswBackendMocks,
    decisionLog({
      scopes: [/^(repo|claude|nitpick)$/, /^(parka|uih)(\/[a-z][a-z0-9-]*)?$/],
    }),
    ...rules,
  ],
});
