import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { mswBackendMocks } from '../rules/msw-backend-mocks.js';

const problemsOf = async (sources: Record<string, string>) => {
  const reports: string[] = [];
  await mswBackendMocks.run?.({
    files: Object.keys(sources),
    readText: async (file) => sources[file] ?? '',
    git: {
      commitMessages: [],
      stagedAddedFiles: [],
      stagedFiles: [],
      lastCommitMessages: async () => [],
    },
    report: (problem) => reports.push(problem),
    meta: { ruleId: 'msw-backend-mocks', projectRoot: '' },
  });
  return reports;
};

const FILE = 'apps/x/src/a.test.tsx';
const problemsIn = (source: string) => problemsOf({ [FILE]: source });

describe('Msw rule rejects', () => {
  it.each([
    "vi.stubGlobal('fetch', fetchMock);",
    'vi.stubGlobal(\n  "fetch",\n  vi.fn(),\n);',
    'globalThis.fetch = vi.fn();',
    'global.fetch = mock;',
    'window.fetch = mock;',
    'self.fetch  =mock;',
    "vi.spyOn(globalThis, 'fetch');",
    'vi.spyOn( window , "fetch" );',
  ])('fetch replaced by %s', async (source) => {
    expect(await problemsIn(`ok\n${source}`)).toEqual([
      `${FILE}:2: backend mocked by replacing fetch, use msw (setupServer + http handlers)`,
    ]);
  });

  it('every occurrence with its own line', async () => {
    expect(
      await problemsIn("vi.stubGlobal('fetch', a);\n\nglobal.fetch = b;"),
    ).toHaveLength(2);
  });
});

describe('Msw rule accepts', () => {
  it.each([
    "vi.stubGlobal('location', { href: '/' });",
    "vi.stubGlobal('Notification', Fake);",
    "vi.stubGlobal('IntersectionObserver', Fake);",
    "vi.spyOn(window, 'open');",
    'if (globalThis.fetch === undefined) {}',
    "const server = setupServer(http.get('/api/x', () => HttpResponse.json({})));",
  ])('%s', async (source) => {
    expect(await problemsIn(source)).toEqual([]);
  });
});

describe('Msw rule metadata works when', () => {
  it('scopes to unit tests and skips e2e', () => {
    expect(mswBackendMocks.include).toContain('apps/*/src/**/*.test.tsx');
    expect(mswBackendMocks.exclude).toEqual(['**/__e2e__/**']);
  });

  it('describes the rule in an instruction file', async () => {
    const { doc } = mswBackendMocks;
    if (typeof doc !== 'object') throw new Error('expected file');
    expect(await readFile(doc.file, 'utf8')).toContain('msw');
  });

  it('shows an msw example as the fix', () => {
    expect(mswBackendMocks.fix).toContain('setupServer');
  });
});
