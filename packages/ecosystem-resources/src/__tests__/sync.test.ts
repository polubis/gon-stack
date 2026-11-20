import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Database, EcosystemConfig } from '../config.ts';
import { driftedFiles, syncEnv, syncToml } from '../sync.ts';

const database: Database = {
  app: 'demo',
  dir: 'apps/demo',
  ports: {
    api: 54101,
    db: 54102,
    shadow: 54103,
    pooler: 54104,
    studio: 54105,
    mail: 54106,
    analytics: 54107,
    inspector: 54108,
  },
  dev: 4303,
  e2e: 4403,
  authPaths: ['/api/auth/callback/'],
  env: {
    file: 'apps/demo/.env.example',
    apiUrlKey: 'API_URL',
    callbackKey: 'CB_URL',
  },
};

const TOML = `project_id = "demo"
[api]
port = 54321
[db]
port = 54322
shadow_port = 54320
[db.pooler]
port = 54329
[studio]
port = 54323
[local_smtp]
port = 54324
[auth]
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
[edge_runtime]
inspector_port = 8083
[analytics]
port = 54327
`;

const ENV =
  'API_URL=http://localhost:54321\nCB_URL=http://localhost:4321\nKEEP=1\n';

describe('syncToml', () => {
  it('writes every registry port into the matching section', () => {
    const next = syncToml(TOML, database);
    expect(next).toContain('[api]\nport = 54101');
    expect(next).toContain('[db]\nport = 54102\nshadow_port = 54103');
    expect(next).toContain('[db.pooler]\nport = 54104');
    expect(next).toContain('[studio]\nport = 54105');
    expect(next).toContain('[local_smtp]\nport = 54106');
    expect(next).toContain('[analytics]\nport = 54107');
    expect(next).toContain('inspector_port = 54108');
  });

  it('derives site url and redirect urls from dev and e2e ports', () => {
    const next = syncToml(TOML, database);
    expect(next).toContain('site_url = "http://localhost:4303"');
    expect(next).toContain(
      'additional_redirect_urls = [\n  "http://localhost:4303/api/auth/callback/",\n  "http://localhost:4403/api/auth/callback/",\n]',
    );
  });

  it('is idempotent', () => {
    const once = syncToml(TOML, database);
    expect(syncToml(once, database)).toBe(once);
  });

  it('fails loudly when a section is missing', () => {
    expect(() => syncToml('[api]\nport = 1\n', database)).toThrow(
      /no \[db\] section/,
    );
  });

  it('fails loudly when a key is missing in a section', () => {
    expect(() =>
      syncToml(TOML.replace('shadow_port = 54320\n', ''), database),
    ).toThrow(/\[db\] misses/);
  });
});

describe('syncEnv', () => {
  it('writes api and callback urls and leaves other keys', () => {
    expect(syncEnv(ENV, database)).toBe(
      'API_URL=http://localhost:54101\nCB_URL=http://localhost:4303\nKEEP=1\n',
    );
  });

  it('skips the callback when the app has none', () => {
    const next = syncEnv(ENV, {
      ...database,
      env: { ...database.env, callbackKey: undefined },
    });
    expect(next).toContain('CB_URL=http://localhost:4321');
  });

  it('fails when the example misses a key', () => {
    expect(() => syncEnv('KEEP=1\n', database)).toThrow(/misses API_URL/);
  });
});

describe('driftedFiles', () => {
  let root: string;
  const config: EcosystemConfig = {
    clean: { paths: [] },
    databases: [database],
    ports: [4303, 4403, ...Object.values(database.ports)],
  };

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'eco-sync-'));
    await mkdir(join(root, 'apps/demo/supabase'), { recursive: true });
    await writeFile(join(root, 'apps/demo/supabase/config.toml'), TOML);
    await writeFile(join(root, 'apps/demo/.env.example'), ENV);
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  it('reports drift without touching files when only checking', async () => {
    expect(await driftedFiles(config, root)).toEqual([
      'apps/demo/supabase/config.toml',
      'apps/demo/.env.example',
    ]);
    expect(await readFile(join(root, 'apps/demo/.env.example'), 'utf8')).toBe(
      ENV,
    );
  });

  it('rewrites drifted files and then reports none', async () => {
    await driftedFiles(config, root, true);
    expect(await driftedFiles(config, root)).toEqual([]);
    expect(
      await readFile(join(root, 'apps/demo/.env.example'), 'utf8'),
    ).toContain('API_URL=http://localhost:54101');
  });
});
