export type SupabaseRole =
  | 'api'
  | 'db'
  | 'shadow'
  | 'pooler'
  | 'studio'
  | 'mail'
  | 'analytics'
  | 'inspector';

export type Database = {
  app: string;
  /** App directory relative to repo root, holds `supabase/config.toml`. */
  dir: string;
  ports: Record<SupabaseRole, number>;
  /** Dev-server and e2e ports of the app, used for auth redirects. */
  dev: number;
  e2e: number;
  /** Auth callback paths allowed to redirect, e.g. `/api/auth/callback/`. */
  authPaths: string[];
  env: { file: string; apiUrlKey: string; callbackKey?: string };
};

export type EcosystemConfig = {
  clean: {
    /** Globs relative to repo root, removed on reset. */
    paths: string[];
    /** Exact relative paths that survive a clean (kept inside removed dirs). */
    keep?: string[];
  };
  databases: Database[];
  /** Every port that must be dead after reset. */
  ports: number[];
};

const ROLES: SupabaseRole[] = [
  'api',
  'db',
  'shadow',
  'pooler',
  'studio',
  'mail',
  'analytics',
  'inspector',
];

const unsafePath = (path: string): boolean =>
  path === '' ||
  path === '.' ||
  path.startsWith('/') ||
  /^[A-Za-z]:/.test(path) ||
  path.split(/[\\/]/).includes('..');

const problemsOf = (value: EcosystemConfig): string[] => {
  const problems: string[] = [];
  for (const path of value.clean.paths)
    if (unsafePath(path))
      problems.push(
        `clean path "${path}" must be relative and stay inside the repo`,
      );
  for (const path of value.clean.keep ?? [])
    if (unsafePath(path))
      problems.push(
        `keep path "${path}" must be relative and stay inside the repo`,
      );
  const seen = new Set<string>();
  for (const database of value.databases) {
    if (seen.has(database.app))
      problems.push(`database "${database.app}" is declared twice`);
    seen.add(database.app);
    if (unsafePath(database.dir))
      problems.push(`database "${database.app}" dir must be relative`);
    for (const role of ROLES)
      if (!Number.isInteger(database.ports[role]))
        problems.push(`database "${database.app}" misses port "${role}"`);
    const known = new Set(value.ports);
    for (const port of [
      database.dev,
      database.e2e,
      ...Object.values(database.ports),
    ])
      if (!known.has(port))
        problems.push(
          `database "${database.app}" uses port ${port} that is not in the registry`,
        );
  }
  return problems;
};

/** Validates the ecosystem config when it loads, so a bad one never runs. */
export const config = (value: EcosystemConfig): EcosystemConfig => {
  const problems = problemsOf(value);
  if (problems.length > 0)
    throw new Error(`Invalid ecosystem config:\n- ${problems.join('\n- ')}`);
  return value;
};
