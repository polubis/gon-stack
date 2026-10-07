import { readFile } from 'node:fs/promises';
import { basename, dirname, join, posix, relative, resolve } from 'node:path';
import { resolveRules } from './config.js';
import type { Config, Importance, Rule } from './config.js';

type Docs = {
  files: Map<string, string>;
  problems: string[];
  rulePaths: Map<string, string>;
};

type Output = { path: string; root: string };

const DEFAULT_OUTPUT: Output[] = [{ path: '.ai', root: 'AGENTS.md' }];
const REF = /\{\{ref:([^}\s]+)\}\}/g;
const ORDER: Importance[] = ['A', 'O', 'D', 'I'];
const TITLES: Record<Importance, string> = {
  A: '(A) Always',
  O: '(O) Optional',
  D: '(D) When directly mentioned',
  I: '(I) Infer during task',
};

const readSource = async (configDir: string, file: string): Promise<string> =>
  (await readFile(resolve(configDir, file), 'utf8')).replaceAll('\r\n', '\n');

const instructionPath = (id: string): string => posix.join('rules', `${id}.md`);

const keysIn = (text: string): string[] =>
  [...text.matchAll(REF)].map((match) => match[1] as string);

const link = (from: string, to: string, label: string): string =>
  `[${label}](${posix.relative(posix.dirname(from), to)})`;

const readSources = async (
  refs: Record<string, string>,
  configDir: string,
  problems: string[],
): Promise<Map<string, string>> => {
  const sources = new Map<string, string>();
  for (const [key, source] of Object.entries(refs)) {
    try {
      sources.set(key, await readSource(configDir, source));
    } catch {
      problems.push(`Knowledge "${key}": missing file ${source}`);
    }
  }
  return sources;
};

const findCycles = (graph: Map<string, string[]>): string[] => {
  const problems: string[] = [];
  const done = new Set<string>();
  const visit = (key: string, path: string[]): void => {
    if (done.has(key)) return;
    const at = path.indexOf(key);
    if (at !== -1) {
      problems.push(
        `Reference cycle: ${[...path.slice(at), key].join(' -> ')}`,
      );
      return;
    }
    for (const next of graph.get(key) ?? []) {
      if (next !== key) visit(next, [...path, key]);
    }
    done.add(key);
  };
  for (const key of graph.keys()) visit(key, []);
  return problems;
};

const validateRefs = (
  refs: Record<string, string>,
  sources: Map<string, string>,
): string[] => {
  const problems: string[] = [];
  const graph = new Map<string, string[]>();
  for (const [key, text] of sources) {
    const targets = keysIn(text);
    graph.set(key, targets);
    for (const target of targets) {
      if (target === key)
        problems.push(`Knowledge "${key}": references itself`);
      else if (!(target in refs)) {
        problems.push(`Knowledge "${key}": unknown ref "${target}"`);
      }
    }
  }
  return [...problems, ...findCycles(graph)];
};

const renderRules = (
  rules: Rule[],
  describe: (rule: Rule) => string,
  problems: string[],
): string => {
  const ids = new Set<string>();
  for (const { id } of rules) {
    if (ids.has(id)) problems.push(`Duplicate rule id "${id}"`);
    ids.add(id);
  }
  const renderByImportance = (items: Rule[]): string =>
    ORDER.map((tag) => ({
      tag,
      rules: items.filter((rule) => (rule.importance ?? 'A') === tag),
    }))
      .filter((section) => section.rules.length > 0)
      .map(
        ({ tag, rules }) =>
          `### ${TITLES[tag]}\n\n` +
          rules.map((rule) => `- ${describe(rule)}`).join('\n'),
      )
      .join('\n\n');

  const groups = new Set(rules.flatMap(({ group }) => (group ? [group] : [])));
  const areas = [
    ...(rules.some(({ group }) => !group) ? [undefined] : []),
    ...groups,
  ];

  return (
    [
      '# Information for AI',
      ...areas.map(
        (area) =>
          `## Rules${area ? ` for ${area[0]?.toUpperCase()}${area.slice(1)}` : ''}\n\n` +
          renderByImportance(rules.filter(({ group }) => group === area)),
      ),
    ].join('\n\n') + '\n'
  );
};

export const buildDocs = async <K extends string>(
  config: Config<K>,
  configDir: string,
  projectRoot: string,
): Promise<Docs> => {
  const problems: string[] = [];
  const files = new Map<string, string>();
  const refs: Record<string, string> = config.knowledge?.refs ?? {};
  const dir = config.knowledge?.dir ?? 'references';
  const target = (key: string): string => posix.join(dir, `${key}.md`);

  const sources = await readSources(refs, configDir, problems);
  problems.push(...validateRefs(refs, sources));

  const ref = (key: string): string => {
    if (!(key in refs)) {
      problems.push(`Rule instruction: unknown ref "${key}"`);
      return key;
    }
    return link('root.md', target(key), key);
  };
  const rules = resolveRules(config) as Rule[];
  const instructionFiles = new Map<string, string>();
  for (const { id, instruction, check, fix } of rules) {
    if (check && !fix) {
      problems.push(`Rule "${id}": fix is required when check is defined`);
    }
    if (typeof instruction === 'function') continue;
    try {
      const text = await readSource(configDir, instruction.file);
      for (const key of keysIn(text)) {
        if (!(key in refs)) problems.push(`Rule "${id}": unknown ref "${key}"`);
      }
      instructionFiles.set(instructionPath(id), text);
    } catch {
      problems.push(`Rule "${id}": missing file ${instruction.file}`);
    }
  }
  const markdown = renderRules(
    rules,
    ({ id, instruction }) =>
      typeof instruction === 'function'
        ? `\`${id}\`: ${instruction({ ref })}`
        : `[${id}](${instructionPath(id)})`,
    problems,
  );

  const [primary = DEFAULT_OUTPUT[0] as Output, ...others] =
    config.output ?? [];
  const primaryPath = join(projectRoot, primary.path, primary.root);
  files.set(primaryPath, markdown);
  for (const [from, text] of instructionFiles) {
    files.set(
      join(projectRoot, primary.path, from),
      text.replace(REF, (_, key: string) => link(from, target(key), key)),
    );
  }
  for (const [key, text] of sources) {
    files.set(
      join(projectRoot, primary.path, target(key)),
      text.replace(REF, (_, other: string) =>
        link(target(key), target(other), other),
      ),
    );
  }
  for (const { path, root } of others) {
    const file = join(projectRoot, path, root);
    const to = relative(dirname(file), primaryPath).replaceAll('\\', '/');
    files.set(
      file,
      `Follow instructions here: [${basename(primaryPath)}](${to})\n`,
    );
  }

  const rulePaths = new Map(
    rules.map(({ id, instruction }) => [
      id,
      posix.join(
        primary.path.replaceAll('\\', '/'),
        typeof instruction === 'function' ? primary.root : instructionPath(id),
      ),
    ]),
  );

  return { files, problems, rulePaths };
};
