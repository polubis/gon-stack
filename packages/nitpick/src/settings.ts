import { join } from 'node:path';
import type { McpServer, Settings } from './config.js';

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

export const buildSettings = (
  settings: Settings,
  outputDir: string,
  projectRoot: string,
): Built => {
  const { name = 'settings.json', mcp = {}, ...rest } = settings;
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
  return { files, problems };
};
