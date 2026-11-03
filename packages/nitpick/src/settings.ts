import { join } from 'node:path';
import type { McpServer, Settings } from './config.js';

export type SettingsSource = { from: string; settings: Settings };

type Built = { files: Map<string, string>; problems: string[] };

const NAMES = ['settings.json', 'settings.local.json'];
const EXPANSION = /\$\{[A-Za-z_][A-Za-z0-9_]*(:-[^}]*)?\}/;
const SECRET_KEY = /token|secret|key|password|passwd|auth|credential|bearer/i;
const SECRET_VALUE = /^(Bearer\s+)?[A-Za-z0-9_\-./+=]{20,}$/;

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const secretProblems = (
  where: string,
  values: Record<string, string> | undefined,
): string[] =>
  Object.entries(values ?? {})
    .filter(
      ([key, value]) =>
        !EXPANSION.test(value) &&
        (SECRET_KEY.test(key) || SECRET_VALUE.test(value)),
    )
    .map(
      ([key]) =>
        `Settings ${where} "${key}": looks like a literal secret, use \${VAR} expansion`,
    );

const serverProblems = (name: string, server: McpServer): string[] =>
  'url' in server
    ? secretProblems(`mcp "${name}" headers`, server.headers)
    : secretProblems(`mcp "${name}" env`, server.env);

// Groups every source by target file. Same key from two sources = config error.
const merge = (
  sources: SettingsSource[],
): { byName: Map<string, Settings>; problems: string[] } => {
  const byName = new Map<string, Settings>();
  const problems: string[] = [];
  for (const { from, settings } of sources) {
    const { name = 'settings.json', ...rest } = settings;
    const target = byName.get(name) ?? {};
    for (const [key, value] of Object.entries(rest)) {
      if (key in target) {
        problems.push(`Settings "${key}" set twice (${from})`);
      } else {
        target[key] = value;
      }
    }
    byName.set(name, target);
  }
  return { byName, problems };
};

const buildFile = (
  name: string,
  settings: Settings,
  outputDir: string,
  projectRoot: string,
): Built & { mcp: boolean } => {
  const { mcp = {}, ...rest } = settings;
  const servers = Object.entries(mcp);
  const problems = [
    ...(NAMES.includes(name)
      ? []
      : [`Settings name "${name}": use ${NAMES.join(' or ')}`]),
    ...servers.flatMap(([server, value]) => [
      ...(server.trim() === '' ? ['Settings mcp: empty server name'] : []),
      ...serverProblems(server, value),
    ]),
    ...secretProblems('env', rest.env as Record<string, string> | undefined),
  ];
  const files = new Map<string, string>();
  files.set(
    join(projectRoot, outputDir, name),
    json(
      servers.length > 0
        ? { ...rest, enabledMcpjsonServers: servers.map(([key]) => key) }
        : rest,
    ),
  );
  if (servers.length > 0) {
    files.set(join(projectRoot, '.mcp.json'), json({ mcpServers: mcp }));
  }
  return { files, problems, mcp: servers.length > 0 };
};

export const buildSettings = (
  sources: SettingsSource[],
  outputDir: string,
  projectRoot: string,
): Built => {
  const { byName, problems: mergeProblems } = merge(sources);
  const files = new Map<string, string>();
  const problems = [...mergeProblems];
  let mcpFiles = 0;
  for (const [name, settings] of byName) {
    const built = buildFile(name, settings, outputDir, projectRoot);
    problems.push(...built.problems);
    for (const [file, text] of built.files) files.set(file, text);
    if (built.mcp) mcpFiles += 1;
  }
  if (mcpFiles > 1) {
    problems.push('Settings mcp: set in more than one settings file');
  }
  return { files, problems };
};
