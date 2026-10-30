// Runs after `pnpm install`: husky, then regenerate the gitignored AI docs.
// Every step is best effort so a missing tool never fails the install.
import { spawnSync } from 'node:child_process';

const steps = [
  ['husky', 'husky'],
  ['nitpick build', 'pnpm turbo run build --filter=@repo/nitpick --ui=stream'],
  ['nitpick sync', 'node packages/nitpick/dist/cli.js --sync'],
];

for (const [name, command] of steps) {
  const { status } = spawnSync(command, { shell: true, stdio: 'inherit' });
  if (status !== 0) {
    console.warn(`prepare: "${name}" failed, skipping the rest`);
    break;
  }
}
