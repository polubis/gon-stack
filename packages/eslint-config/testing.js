import testingLibrary from 'eslint-plugin-testing-library';
import { plugin } from './plugin.js';

const UNIT = ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'];
const E2E = ['**/__e2e__/**/*.ts'];
const E2E_SPECS = ['**/__e2e__/**/*.spec.ts'];
const WINDOW_LIKE = '/^(globalThis|global|window|self)$/';

const noFetchMock = [
  {
    selector:
      "CallExpression[callee.object.name='vi'][callee.property.name='stubGlobal'][arguments.0.value='fetch']",
    message:
      'Do not stub fetch. Mock HTTP with msw (setupServer + http handlers).',
  },
  {
    selector: `AssignmentExpression[left.type='MemberExpression'][left.property.name='fetch'][left.object.name=${WINDOW_LIKE}]`,
    message:
      'Do not replace fetch. Mock HTTP with msw (setupServer + http handlers).',
  },
  {
    selector: `CallExpression[callee.object.name='vi'][callee.property.name='spyOn'][arguments.0.name=${WINDOW_LIKE}][arguments.1.value='fetch']`,
    message:
      'Do not spy on fetch. Mock HTTP with msw (setupServer + http handlers).',
  },
];

const noE2eSelectorsInUnit = [
  {
    selector: 'Literal[value=/data-e2e/]',
    message: 'Unit tests use accessible selectors, never data-e2e.',
  },
  {
    selector: 'TemplateElement[value.raw=/data-e2e/]',
    message: 'Unit tests use accessible selectors, never data-e2e.',
  },
  {
    selector: "JSXAttribute[name.name='data-e2e']",
    message: 'Unit tests use accessible selectors, never data-e2e.',
  },
];

const noRenderQueries = [
  {
    selector:
      "VariableDeclarator[init.callee.name='render'] > ObjectPattern > Property[key.name=/^(get|query|find)(All)?By/]",
    message:
      'Do not destructure queries from render(). Query through screen (or within for a scope).',
  },
];

const noFocusedOrDisabled = [
  {
    selector:
      'CallExpression[callee.type="MemberExpression"][callee.property.name="only"][callee.object.name=/^(it|test|describe)$/]',
    message: 'Focused test (.only) would silently skip the rest of the suite.',
  },
  {
    selector:
      'CallExpression[callee.type="MemberExpression"][callee.property.name="skip"][callee.object.name=/^(it|test|describe)$/][arguments.0.type=/^(Literal|TemplateLiteral)$/][arguments.1.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
    message:
      'Disabled test (.skip). Fix or delete it; if skipped on purpose, disable this rule on the line with the reason.',
  },
  {
    selector: 'CallExpression[callee.name=/^x(it|test|describe)$/]',
    message:
      'Disabled test (xit/xtest/xdescribe). Fix or delete it, do not leave it dormant.',
  },
];

const e2eLocatorMessage =
  'Raw locator in e2e. Reach elements through the typed getByE2e / getByE2ePrefix selectors of the module.';

const noRawE2eLocators = [
  {
    selector:
      'CallExpression[callee.type="MemberExpression"][callee.property.name=/^(locator|getByText|getByLabel|getByPlaceholder|getByTitle|getByAltText|getByTestId)$/]',
    message: e2eLocatorMessage,
  },
];

/**
 * Test conventions: unit (`*.test.*`, `__tests__`) and e2e (`__e2e__`).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  {
    files: UNIT,
    plugins: { repo: plugin, 'testing-library': testingLibrary },
    rules: {
      'no-restricted-syntax': [
        'error',
        ...noFetchMock,
        ...noE2eSelectorsInUnit,
        ...noRenderQueries,
        ...noFocusedOrDisabled,
      ],
      'repo/test-title': ['error', { maxLength: 100 }],
      'repo/expect-expect': 'error',
      'repo/msw-lifecycle': 'error',
      'testing-library/no-container': 'error',
      'testing-library/no-node-access': 'error',
      'testing-library/no-test-id-queries': 'error',
      'testing-library/no-debugging-utils': 'error',
      'testing-library/no-await-sync-queries': 'error',
      'testing-library/await-async-queries': 'error',
      'testing-library/await-async-events': 'error',
      'testing-library/no-wait-for-multiple-assertions': 'error',
    },
  },
  {
    files: E2E,
    plugins: { repo: plugin },
    rules: {
      'repo/test-title': ['error', { maxLength: 100 }],
      'no-restricted-syntax': ['error', ...noFocusedOrDisabled],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['test', 'chromium', 'firefox', 'webkit', 'devices'],
              message:
                'Build e2e on @repo/vibe-test (createE2eTest + interpreter), not on the raw Playwright test.',
            },
          ],
        },
      ],
    },
  },
  {
    files: E2E_SPECS,
    rules: {
      'no-restricted-syntax': [
        'error',
        ...noFocusedOrDisabled,
        ...noRawE2eLocators,
      ],
    },
  },
  // Selector modules and fixtures are where raw locators belong.
  {
    files: ['**/__e2e__/test.ts', '**/__e2e__/locators.ts'],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-syntax': ['error', ...noFocusedOrDisabled],
    },
  },
];
