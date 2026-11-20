import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Database, EcosystemConfig, SupabaseRole } from './config.ts';

type TomlKey = { section: string; key: string };

const TOML_KEYS: Record<SupabaseRole, TomlKey> = {
  api: { section: 'api', key: 'port' },
  db: { section: 'db', key: 'port' },
  shadow: { section: 'db', key: 'shadow_port' },
  pooler: { section: 'db.pooler', key: 'port' },
  studio: { section: 'studio', key: 'port' },
  mail: { section: 'local_smtp', key: 'port' },
  analytics: { section: 'analytics', key: 'port' },
  inspector: { section: 'edge_runtime', key: 'inspector_port' },
};

const escape = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replaces `match` inside one `[section]` of a TOML file, throws when absent. */
const editSection = (
  content: string,
  section: string,
  pattern: RegExp,
  replacement: string,
): string => {
  const header = new RegExp(`^\\[${escape(section)}\\][ \\t]*$`, 'm').exec(
    content,
  );
  if (!header) throw new Error(`config.toml has no [${section}] section`);
  const start = header.index + header[0].length;
  const next = /^\[/m.exec(content.slice(start));
  const end = next ? start + next.index : content.length;
  const body = content.slice(start, end);
  if (!pattern.test(body))
    throw new Error(`config.toml [${section}] misses ${pattern.source}`);
  return (
    content.slice(0, start) +
    body.replace(pattern, replacement) +
    content.slice(end)
  );
};

const origin = (port: number): string => `http://localhost:${port}`;

export const syncToml = (content: string, database: Database): string => {
  let next = content;
  for (const [role, { section, key }] of Object.entries(TOML_KEYS))
    next = editSection(
      next,
      section,
      new RegExp(`^${key}[ \\t]*=[ \\t]*\\d+`, 'm'),
      `${key} = ${database.ports[role as SupabaseRole]}`,
    );
  next = editSection(
    next,
    'auth',
    /^site_url[ \t]*=.*$/m,
    `site_url = "${origin(database.dev)}"`,
  );
  const urls = [database.dev, database.e2e].flatMap((port) =>
    database.authPaths.map((path) => `  "${origin(port)}${path}",`),
  );
  return editSection(
    next,
    'auth',
    /^additional_redirect_urls[ \t]*=[ \t]*\[[^\]]*\]/m,
    `additional_redirect_urls = [\n${urls.join('\n')}\n]`,
  );
};

const setEnv = (content: string, key: string, value: string): string => {
  const line = new RegExp(`^${escape(key)}=.*$`, 'm');
  if (!line.test(content)) throw new Error(`env example misses ${key}`);
  return content.replace(line, `${key}=${value}`);
};

export const syncEnv = (content: string, database: Database): string => {
  const { apiUrlKey, callbackKey } = database.env;
  const next = setEnv(content, apiUrlKey, origin(database.ports.api));
  return callbackKey ? setEnv(next, callbackKey, origin(database.dev)) : next;
};

type Target = { file: string; transform: (content: string) => string };

const targetsOf = (config: EcosystemConfig): Target[] =>
  config.databases.flatMap((database) => [
    {
      file: join(database.dir, 'supabase/config.toml'),
      transform: (content: string) => syncToml(content, database),
    },
    {
      file: database.env.file,
      transform: (content: string) => syncEnv(content, database),
    },
  ]);

/** Files whose content differs from what the registry generates. */
export const driftedFiles = async (
  config: EcosystemConfig,
  root: string,
  write = false,
): Promise<string[]> => {
  const drifted: string[] = [];
  for (const { file, transform } of targetsOf(config)) {
    const path = join(root, file);
    const current = await readFile(path, 'utf8');
    const next = transform(current);
    if (next === current) continue;
    drifted.push(file);
    if (write) await writeFile(path, next);
  }
  return drifted;
};
