import { defineConfig } from '@repo/nitpick';

/** One top-level key per check (`nitpick <check>`). */
export default defineConfig({
  // Valid package.json files with unique names across the workspace.
  manifests: {},
  // Decision log: each commit must add a new `__log__` entry in every owning
  // folder (nearest `__log__` above the changed files). Compared with origin/main.
  log: {},
  // Known vulnerabilities (pnpm audit); rules count unique vulnerable packages.
  audit: [
    { level: 'high', fail: 1 },
    { level: 'low', warn: 1 },
  ],
  // Unique outdated package names per rule; one rule per ncu target.
  outdated: [
    { target: 'minor', warn: 5, fail: 12 },
    // { target: "latest", warn: 3 }, // majors count too; warn only
  ],
  hash: {
    // Regexes on paths relative to the target. Defaults: ts/tsx/js/jsx/css/scss
    // included; node_modules/dist/.turbo/__snapshots__ and *.test/*.spec excluded.
    // include: [/\.(tsx?|css)$/],
    // exclude: [/\.stories\.tsx$/],
    targets: [
      // `path`  = exact directory or single file (repo-relative)
      // `match` = regex on repo-relative directories, every hit is a target
      // `doc`   = markdown holding the hash (default AGENTS.md next to target)
      { path: 'apps/romantic-app/src/modules/user-profile-setup' },
    ],
  },
});
