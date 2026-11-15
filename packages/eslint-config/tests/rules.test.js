import { describe, expect, it } from 'vitest';
import { lint, lintFixture } from './lint.js';

const UNIT = 'src/modules/time/__tests__/time.test.tsx';
const SPEC = 'src/modules/time/__e2e__/time.spec.ts';
const SELECTORS = 'src/modules/time/__e2e__/locators.ts';
const CORE = 'src/modules/time/core/store.ts';
const DOMAIN = 'src/modules/time/domain/models.ts';
const VIEW = 'src/modules/time/presentation/main.tsx';
const SERVER = 'src/server/application/procedures/tasks.ts';

const RTL = "import { render, screen } from '@testing-library/react';\n";
const MSW = "import { setupServer } from 'msw/node';\n";

const hits = async (file, code, ruleId) =>
  (await lint(file, code)).filter((message) => message.ruleId === ruleId);

const reacts = async (file, code, ruleId, text) => {
  const found = await hits(file, code, ruleId);
  expect(found.length, `${ruleId} should react to:\n${code}`).toBeGreaterThan(
    0,
  );
  if (text) expect(found[0].message).toContain(text);
};

const quiet = async (file, code, ruleId) =>
  expect(await hits(file, code, ruleId), `${ruleId} should stay quiet`).toEqual(
    [],
  );

const RESTRICTED = 'no-restricted-syntax';

describe('unit: backend mocks', () => {
  it.each([
    ["vi.stubGlobal('fetch', vi.fn());"],
    ['globalThis.fetch = vi.fn();'],
    ['global.fetch = vi.fn();'],
    ['window.fetch = vi.fn();'],
    ['self.fetch = vi.fn();'],
    ["vi.spyOn(globalThis, 'fetch');"],
    ["vi.spyOn(window, 'fetch');"],
  ])('flags a replaced fetch: %s', (code) =>
    reacts(UNIT, code, RESTRICTED, 'msw'),
  );

  it('lets other browser APIs be stubbed', () =>
    quiet(UNIT, "vi.stubGlobal('Notification', class {});", RESTRICTED));

  it('flags a server without onUnhandledRequest error', () =>
    reacts(
      UNIT,
      `${MSW}const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`,
      'repo/msw-lifecycle',
      'onUnhandledRequest',
    ));

  it('flags a server that never resets handlers', () =>
    reacts(
      UNIT,
      `${MSW}const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());`,
      'repo/msw-lifecycle',
      'resetHandlers',
    ));

  it('flags a server that is never closed', () =>
    reacts(
      UNIT,
      `${MSW}const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());`,
      'repo/msw-lifecycle',
      'server.close',
    ));

  it('flags a server started outside beforeAll', () =>
    reacts(
      UNIT,
      `${MSW}const server = setupServer();
server.listen({ onUnhandledRequest: 'error' });
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`,
      'repo/msw-lifecycle',
      'beforeAll',
    ));

  it('accepts the full msw lifecycle', () =>
    quiet(
      UNIT,
      `${MSW}const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`,
      'repo/msw-lifecycle',
    ));

  it('ignores files without an msw server', () =>
    quiet(
      UNIT,
      'const resource = open();\nresource.close();',
      'repo/msw-lifecycle',
    ));
});

describe('unit: selectors', () => {
  it.each([
    ['document.querySelector(\'[data-e2e="a"]\');'],
    ['const id = `[data-e2e="${name}"]`;'],
    ['const view = <div data-e2e="a" />;'],
  ])('flags e2e selectors in unit tests: %s', (code) =>
    reacts(UNIT, code, RESTRICTED, 'data-e2e'),
  );

  it('flags test-id queries', () =>
    reacts(
      UNIT,
      `${RTL}it('finds it', () => { expect(screen.getByTestId('a')).toBeDefined(); });`,
      'testing-library/no-test-id-queries',
    ));

  it.each([
    ['const { getByRole } = render(<a />);'],
    ['const { findAllByText, user } = render(<a />);'],
  ])('flags queries destructured from render: %s', (code) =>
    reacts(UNIT, code, RESTRICTED, 'destructure queries'),
  );

  it('accepts render helpers and scoped queries', () =>
    quiet(
      UNIT,
      `${RTL}const { rerender, unmount } = render(<a />);
const list = within(screen.getByRole('list'));
list.getByRole('listitem');`,
      RESTRICTED,
    ));

  it('flags container queries', () =>
    reacts(
      UNIT,
      `${RTL}it('finds it', () => { const { container } = render(<a />); expect(container.querySelector('a')).toBeDefined(); });`,
      'testing-library/no-container',
    ));

  it('flags DOM tree walking', () =>
    reacts(
      UNIT,
      `${RTL}it('finds it', () => { expect(screen.getByRole('link').parentElement).toBeDefined(); });`,
      'testing-library/no-node-access',
    ));

  it('flags leftover debug output', () =>
    reacts(
      UNIT,
      `${RTL}it('shows it', () => { render(<a />); screen.debug(); expect(1).toBe(1); });`,
      'testing-library/no-debugging-utils',
    ));

  it('flags a find query that is not awaited', () =>
    reacts(
      UNIT,
      `${RTL}it('finds it', async () => { screen.findByRole('link'); expect(1).toBe(1); });`,
      'testing-library/await-async-queries',
    ));

  it('flags an await on a sync query', () =>
    reacts(
      UNIT,
      `${RTL}it('finds it', async () => { await screen.getByRole('link'); expect(1).toBe(1); });`,
      'testing-library/no-await-sync-queries',
    ));

  it('flags a user event that is not awaited', () =>
    reacts(
      UNIT,
      `import userEvent from '@testing-library/user-event';
it('clicks it', async () => { const user = userEvent.setup(); user.click(document.body); expect(1).toBe(1); });`,
      'testing-library/await-async-events',
    ));

  it('flags several assertions on one value in a waitFor', () =>
    reacts(
      UNIT,
      `import { waitFor } from '@testing-library/react';
it('waits', async () => {
  await waitFor(() => {
    expect(total).toBe(1);
    expect(total).toBeGreaterThan(0);
  });
});
`,
      'testing-library/no-wait-for-multiple-assertions',
    ));

  it('accepts accessible screen queries', () =>
    Promise.all(
      [
        'testing-library/no-test-id-queries',
        'testing-library/no-container',
        'testing-library/no-node-access',
      ].map((ruleId) =>
        quiet(
          UNIT,
          `${RTL}it('finds it', () => { render(<a href="/">home</a>); expect(screen.getByRole('link', { name: 'home' })).toBeDefined(); });`,
          ruleId,
        ),
      ),
    ));
});

describe('unit: test hygiene', () => {
  it.each([
    ["it.only('works', () => { expect(1).toBe(1); });"],
    ["test.only('works', () => { expect(1).toBe(1); });"],
    ["describe.only('suite', () => {});"],
  ])('flags a focused test: %s', (code) =>
    reacts(UNIT, code, RESTRICTED, 'Focused'),
  );

  it.each([
    ["it.skip('works', () => { expect(1).toBe(1); });"],
    ["describe.skip('suite', () => {});"],
    ["xit('works', () => { expect(1).toBe(1); });"],
    ["xdescribe('suite', () => {});"],
  ])('flags a disabled test: %s', (code) =>
    reacts(UNIT, code, RESTRICTED, 'Disabled'),
  );

  it.each([
    [
      "it('Given a user, when saving, then done', () => { expect(1).toBe(1); });",
    ],
    ["it('when the form is empty it fails', () => { expect(1).toBe(1); });"],
    ["describe('Then the list shows', () => {});"],
  ])('flags Gherkin titles: %s', (code) =>
    reacts(UNIT, code, 'repo/test-title', 'Gherkin'),
  );

  it('flags a title that is too long', () =>
    reacts(
      UNIT,
      `it('${'a very long title '.repeat(8)}', () => { expect(1).toBe(1); });`,
      'repo/test-title',
      'max 100',
    ));

  it('flags two tests with the same title in one block', () =>
    reacts(
      UNIT,
      `describe('list', () => {
  it('shows rows', () => { expect(1).toBe(1); });
  it('shows rows', () => { expect(2).toBe(2); });
});`,
      'repo/test-title',
      'Duplicate',
    ));

  it('allows the same title in different blocks', () =>
    quiet(
      UNIT,
      `describe('list', () => { it('shows rows', () => { expect(1).toBe(1); }); });
describe('grid', () => { it('shows rows', () => { expect(1).toBe(1); }); });`,
      'repo/test-title',
    ));

  it('accepts short user-story titles', () =>
    quiet(
      UNIT,
      "it('shows an error for an empty name', () => { expect(1).toBe(1); });",
      'repo/test-title',
    ));

  it('flags a test without an assertion', () =>
    reacts(
      UNIT,
      "it('renders', () => { render(<a />); });",
      'repo/expect-expect',
      'no assertion',
    ));

  it('accepts expect, expect-style helpers and throwing queries', () =>
    Promise.all([
      quiet(
        UNIT,
        "it('renders', () => { expect(1).toBe(1); });",
        'repo/expect-expect',
      ),
      quiet(
        UNIT,
        "it('renders', async () => { await expectToastShown('x'); });",
        'repo/expect-expect',
      ),
      quiet(UNIT, "it.todo('later');", 'repo/expect-expect'),
      quiet(
        UNIT,
        "it('renders', () => { screen.getByRole('heading', { name: 'a' }); });",
        'repo/expect-expect',
      ),
      quiet(
        UNIT,
        "it('renders', async () => { await dialog.findByText('a'); });",
        'repo/expect-expect',
      ),
    ]));
});

describe('e2e', () => {
  it('flags the raw Playwright test import', () =>
    reacts(
      SPEC,
      "import { test } from '@playwright/test';",
      'no-restricted-imports',
      'vibe-test',
    ));

  it('allows expect and request from Playwright', () =>
    quiet(
      SPEC,
      "import { expect, request, type Page } from '@playwright/test';",
      'no-restricted-imports',
    ));

  it.each([
    ["page.locator('.row');"],
    ["page.getByText('Save');"],
    ["page.getByLabel('Name');"],
    ["page.getByPlaceholder('Name');"],
    ["page.getByTestId('save');"],
  ])('flags a raw locator in a spec: %s', (code) =>
    reacts(SPEC, code, RESTRICTED, 'typed getByE2e'),
  );

  it('accepts typed selectors in a spec', () =>
    quiet(SPEC, "getByE2e('time:save');", RESTRICTED));

  it('lets the selector module hold raw locators', () =>
    quiet(SELECTORS, "page.locator('.row');", RESTRICTED));

  it.each([
    ["test.only('saves', async () => {});"],
    ["test.skip('saves', async () => {});"],
  ])('flags a focused or disabled spec: %s', (code) =>
    reacts(SPEC, code, RESTRICTED),
  );

  it('flags Gherkin titles in a spec', () =>
    reacts(
      SPEC,
      "test('Given a task, when saved, then listed', async () => {});",
      'repo/test-title',
      'Gherkin',
    ));
});

describe('conventions: barrels', () => {
  it.each([
    ["export * from './a';"],
    ["export * as a from './a';"],
    ["export { a } from './a';"],
    ["export { default } from './a';"],
  ])('flags a barrel export: %s', (code) =>
    reacts(CORE, code, 'repo/no-barrel', 'Barrel'),
  );

  it('accepts local exports', () =>
    quiet(
      CORE,
      'const a = 1;\nexport { a };\nexport const b = 2;',
      'repo/no-barrel',
    ));
});

describe('conventions: tailwind tokens', () => {
  it.each([
    ['<div className="w-[320px]" />'],
    ['<div className="p-[1.5px] flex" />'],
    ['<div className="md:w-[calc(100%-16px)]" />'],
    ["const c = cn('flex', 'h-[48px]');"],
    ['const c = `top-[10px] ${x}`;'],
  ])('flags raw px classes: %s', (code) =>
    reacts(VIEW, code, 'repo/no-raw-tailwind', 'px'),
  );

  it.each([
    ['<div className="z-10" />'],
    ['<div className="hover:z-[50]" />'],
    ['<div className="-z-10" />'],
    ['<div className="z-auto" />'],
    ["const c = cn('relative', 'z-50');"],
  ])('flags raw z-index classes: %s', (code) =>
    reacts(VIEW, code, 'repo/no-raw-tailwind', 'z-index'),
  );

  it('flags raw px in inline styles', () =>
    reacts(
      VIEW,
      "<div style={{ width: '10px' }} />",
      'repo/no-raw-tailwind',
      'inline style',
    ));

  it.each([
    ['<div className="z-(--z-toast) w-80 p-4" />'],
    ['<div className="md:w-(--card-width)" />'],
    ["<div style={{ width: 'var(--card-width)' }} />"],
    ["const label = 'z-index scale';"],
    ["import x from './w-[10px].css';"],
  ])('accepts tokens: %s', (code) => quiet(VIEW, code, 'repo/no-raw-tailwind'));
});

describe('conventions: accessibility', () => {
  it('flags an image without alt text', () =>
    reacts(VIEW, '<img src="a.png" />', 'jsx-a11y/alt-text'));

  it('flags a click handler on a plain div', () =>
    reacts(
      VIEW,
      '<div onClick={() => {}} />',
      'jsx-a11y/click-events-have-key-events',
    ));

  it('flags an empty anchor', () =>
    reacts(VIEW, '<a href="/x" />', 'jsx-a11y/anchor-has-content'));

  it('accepts accessible markup', () =>
    quiet(
      VIEW,
      '<button type="button" onClick={() => {}}>Save</button>',
      'jsx-a11y/click-events-have-key-events',
    ));
});

describe('conventions: layers', () => {
  it('flags UI imports in the domain', () =>
    reacts(
      DOMAIN,
      "import { useState } from 'react';",
      'no-restricted-imports',
      'domain',
    ));

  it.each([
    ["import { x } from '../presentation/view';"],
    ["import { x } from '../integration/repository';"],
    ["import { x } from '../core/store';"],
  ])('flags other layers in the domain: %s', (code) =>
    reacts(DOMAIN, code, 'no-restricted-imports', 'domain'),
  );

  it('flags presentation imports in core', () =>
    reacts(
      CORE,
      "import { View } from '../presentation/main';",
      'no-restricted-imports',
      'core',
    ));

  it('lets core use react and domain', () =>
    quiet(
      CORE,
      "import { useSyncExternalStore } from 'react';\nimport { a } from '../domain/models';",
      'no-restricted-imports',
    ));

  it('lets presentation use core', () =>
    quiet(
      VIEW,
      "import { facade } from '../core/facade';",
      'no-restricted-imports',
    ));
});

describe('supabase errors', () => {
  const SUPABASE =
    "import { createClient } from '@/shared/data-sources/supabase-server';\n";

  it.each([
    ['throw new InternalServer(error);'],
    ['throw new InternalServer(result.error);'],
    ['throw new InternalServer(result.error?.message);'],
    ['throw new InternalServer(itemsError);'],
  ])('flags a raw InternalServer on a Supabase result: %s', (code) =>
    reacts(
      SERVER,
      `${SUPABASE}${code}`,
      'repo/no-raw-internal-server',
      'fromSupabaseError',
    ),
  );

  it.each([
    ["throw new InternalServer(new Error('PARKA_AI_API_KEY is not set'));"],
    ["throw new InternalServer('Failed to read the receipt');"],
    ['throw fromSupabaseError(error);'],
  ])('accepts a mapped or non-Supabase failure: %s', (code) =>
    quiet(SERVER, `${SUPABASE}${code}`, 'repo/no-raw-internal-server'),
  );

  it('accepts a caught unknown error', () =>
    quiet(
      SERVER,
      `${SUPABASE}try { run(); } catch (error) { throw new InternalServer(error); }`,
      'repo/no-raw-internal-server',
    ));

  it('accepts an error in a file that never touches Supabase', () =>
    Promise.all([
      quiet(
        SERVER,
        "throw new InternalServer(error, 'Invalid response payload');",
        'repo/no-raw-internal-server',
      ),
      quiet(
        SERVER,
        'throw new InternalServer(parsed.error);',
        'repo/no-raw-internal-server',
      ),
    ]));

  it('ignores files outside the server', () =>
    quiet(
      VIEW,
      `${SUPABASE}throw new InternalServer(result.error);`,
      'repo/no-raw-internal-server',
    ));
});

describe('type-aware', () => {
  it('flags a switch that misses a union member', async () => {
    const found = await lintFixture('bad');
    expect(found.map((item) => item.ruleId)).toContain(
      '@typescript-eslint/switch-exhaustiveness-check',
    );
  });

  it('accepts a switch that covers every member', async () =>
    expect(await lintFixture('good')).toEqual([]));
});
