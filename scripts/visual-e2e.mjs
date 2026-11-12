// Runs visual e2e specs inside the pinned Playwright image so baselines are
// identical on Windows, the VPS and CI. Usage: node scripts/visual-e2e.mjs [--update]
import { spawnSync } from 'node:child_process';
import { globSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const update = process.argv.includes('--update');

const version = readFileSync(
  resolve(root, 'pnpm-workspace.yaml'),
  'utf8',
).match(/'@playwright\/test':\s*([\d.]+)/)?.[1];
if (!version)
  throw new Error('@playwright/test version not found in the catalog');
const node = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  .engines.node;
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

// Container gets its own Linux node_modules: host ones hold native binaries of the host OS.
const workspaces = ['apps', 'packages'].flatMap((dir) =>
  readdirSync(resolve(root, dir))
    .filter((name) => existsSync(resolve(root, dir, name, 'package.json')))
    .map((name) => `${dir}/${name}`),
);
const volumes = ['.', ...workspaces].flatMap((path) => [
  '-v',
  `visual-e2e-modules-${path.replaceAll('/', '-').replace('.', 'root')}:/work/${path}/node_modules`,
]);

// Only apps owning visual specs: Playwright fails on "No tests found" elsewhere.
const filters = workspaces
  .filter((path) => path.startsWith('apps/'))
  .filter((path) =>
    globSync('src/**/__e2e__/**/*.spec.ts', { cwd: resolve(root, path) }).some(
      (file) =>
        readFileSync(resolve(root, path, file), 'utf8').includes(
          'matches visual baseline',
        ),
    ),
  )
  .map((path) => `--filter=./${path}`)
  .join(' ');

const task = update ? 'test:e2e:update-snapshots' : 'test:e2e';
const script = [
  // image Node can trail the engines pin
  `npm install -g --force node@${node}`,
  'hash -r',
  'corepack enable',
  'pnpm install --frozen-lockfile --config.confirmModulesPurge=false',
  `pnpm turbo run ${task} ${filters} --concurrency=1 --env-mode=loose --cache=local:,remote: --ui=stream`,
].join(' && ');

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    '-w',
    '/work',
    '-e',
    'VIBE_VISUAL=1',
    '-v',
    `${root}:/work`,
    ...volumes,
    '-e',
    'npm_config_store_dir=/pnpm-store',
    '-v',
    'visual-e2e-pnpm-store:/pnpm-store',
    image,
    'bash',
    '-c',
    script,
  ],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
