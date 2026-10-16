import { fileURLToPath } from 'node:url';
import type { RuleUnit } from '../config.js';

const FETCH_MOCKS = [
  /\bvi\.stubGlobal\(\s*['"`]fetch['"`]/g,
  /\b(?:globalThis|global|window|self)\.fetch\s*=(?!=)/g,
  /\bvi\.spyOn\(\s*(?:globalThis|global|window|self)\s*,\s*['"`]fetch['"`]/g,
];
const FIX = `Replace the fetch mock with msw. Example:
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
const server = setupServer(
  http.get('/api/dashboard', () => HttpResponse.json({ code: 200, data: {} })),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
Per test override: server.use(http.post('/api/expenses', () => HttpResponse.json({ code: 500, message: 'boom' })))`;

const lineOf = (text: string, index: number): number =>
  text.slice(0, index).split('\n').length;

export const mswBackendMocks: RuleUnit = {
  importance: 'A',
  include: [
    'apps/*/src/**/*.test.ts',
    'apps/*/src/**/*.test.tsx',
    'apps/*/src/**/__tests__/*.ts',
    'apps/*/src/**/__tests__/*.tsx',
  ],
  exclude: ['**/__e2e__/**'],
  fix: FIX,
  doc: {
    file: fileURLToPath(new URL('msw-backend-mocks.md', import.meta.url)),
  },
  run: async ({ files, readText, report }) => {
    for (const file of files) {
      const text = await readText(file);
      for (const pattern of FETCH_MOCKS)
        for (const match of text.matchAll(pattern))
          report(
            `${file}:${lineOf(text, match.index)}: backend mocked by replacing fetch, use msw (setupServer + http handlers)`,
          );
    }
  },
};
