// Fails on ANY known vulnerability (all severities, prod + dev deps).
// Fail closed: unreadable audit output counts as failure.
import { spawnSync } from 'node:child_process';

// shell: true needed on Windows, where pnpm is a pnpm.cmd shim
const { stdout, error } = spawnSync('pnpm', ['audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  shell: true,
});

const fail = (message) => {
  console.error(`audit: ${message}`);
  process.exit(1);
};

if (error) fail(`cannot run pnpm audit: ${error.message}`);

let report;
try {
  report = JSON.parse(stdout);
} catch {
  fail('pnpm audit returned no JSON (network down?), treating as failure');
}

const counts = report?.metadata?.vulnerabilities;
if (!counts) fail('pnpm audit JSON has no vulnerability counts');

const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
if (total === 0) {
  console.log('audit: 0 vulnerabilities');
  process.exit(0);
}

for (const advisory of Object.values(report.advisories ?? {}))
  console.error(
    `audit: ${advisory.severity} ${advisory.module_name}@${advisory.findings.map((f) => f.version).join(',')} (fix ${advisory.patched_versions}) ${advisory.url}`,
  );
fail(`${total} vulnerabilities found (${JSON.stringify(counts)})`);
