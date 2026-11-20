import { describe, expect, it } from 'vitest';
import { config, type EcosystemConfig } from '../config.ts';

const ports = {
  api: 1,
  db: 2,
  shadow: 3,
  pooler: 4,
  studio: 5,
  mail: 6,
  analytics: 7,
  inspector: 8,
};
const base: EcosystemConfig = {
  clean: {
    paths: ['.evidences', 'apps/*/test-results'],
    keep: ['.evidences/factory.lock'],
  },
  databases: [
    {
      app: 'a',
      dir: 'apps/a',
      ports,
      dev: 10,
      e2e: 11,
      authPaths: [],
      env: { file: 'apps/a/.env.example', apiUrlKey: 'K' },
    },
  ],
  ports: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11],
};

describe('ecosystem config validation', () => {
  it('accepts a coherent config', () => {
    expect(config(base)).toBe(base);
  });

  it.each(['/etc', '..', '../x', 'a/../b', '.', '', 'C:\\x'])(
    'rejects clean path %j that could escape the repo',
    (path) => {
      expect(() => config({ ...base, clean: { paths: [path] } })).toThrow(
        /clean path/,
      );
    },
  );

  it('rejects an unsafe keep path', () => {
    expect(() =>
      config({ ...base, clean: { paths: [], keep: ['../x'] } }),
    ).toThrow(/keep path/);
  });

  it('rejects a database port that is not in the registry', () => {
    expect(() => config({ ...base, ports: [1, 2] })).toThrow(
      /not in the registry/,
    );
  });

  it('rejects a database with a missing role', () => {
    const broken = {
      ...base.databases[0]!,
      ports: { ...ports, api: undefined as unknown as number },
    };
    expect(() => config({ ...base, databases: [broken] })).toThrow(
      /misses port "api"/,
    );
  });

  it('rejects the same database twice and an absolute dir', () => {
    const db = base.databases[0]!;
    expect(() =>
      config({ ...base, databases: [db, { ...db, dir: '/abs' }] }),
    ).toThrow(/declared twice[\s\S]*dir must be relative/);
  });
});
