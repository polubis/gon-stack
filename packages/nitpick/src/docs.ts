import { readFile } from 'node:fs/promises';
import { basename, dirname, join, posix, relative, resolve } from 'node:path';
import { resolveRules } from './config.js';
import type { Config, DocsText, Rule } from './config.js';
import { buildSettings } from './settings.js';

type Docs = {
  files: Map<string, string>;
  problems: string[];
  rulePaths: Map<string, string>;
};

type Output = { path: string; root: string };

const DEFAULT_OUTPUT: Output[] = [{ path: '.ai', root: 'AGENTS.md' }];
const REF = /\{\{ref:([^}\s]+)\}\}/g;

export const AODI_LEGEND = [
  '## AODI framework',
  '',
  'Rules meaning:',
  '',
  '| Tag | Meaning                                     |',
  '| --- | ------------------------------------------- |',
  '| `A` | always - apply every task                   |',
  '| `O` | optional - use when helpful                 |',
  '| `D` | when directly mentioned - only if user asks |',
  '| `I` | infer during task - apply when context fits |',
].join('\n');

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

type Resolve = (
  text: DocsText<string> | undefined,
  label: string,
  from: string,
  meta?: { group?: string },
) => Promise<string | undefined>;

type Rendered = { root: string; groups: Map<string, string> };

const GROUP_NAME = /^[\w-]+$/;

const groupPath = (group: string): string => posix.join('rules', `${group}.md`);

const renderRules = async (
  rules: Rule[],
  describe: (rule: Rule, from: string) => string,
  problems: string[],
  docs: NonNullable<Config['docs']>,
  resolveText: Resolve,
): Promise<Rendered> => {
  const ids = new Set<string>();
  for (const { id } of rules) {
    if (ids.has(id)) problems.push(`Duplicate rule id "${id}"`);
    ids.add(id);
  }
  const groups = new Set(rules.flatMap(({ group }) => (group ? [group] : [])));
  for (const key of Object.keys(docs.groups ?? {})) {
    if (!groups.has(key))
      problems.push(`Docs groups "${key}": no rule uses it`);
  }
  for (const group of groups) {
    if (!GROUP_NAME.test(group)) {
      problems.push(`Group "${group}": use letters, digits, "_" or "-"`);
    }
    if (ids.has(group)) {
      problems.push(`Group "${group}": same name as a rule id file`);
    }
  }

  const list = (items: Rule[], from: string): string =>
    items
      .map(
        (rule, index) =>
          `${index + 1}. (${rule.importance ?? 'A'}) ${describe(rule, from)}`,
      )
      .join('\n');

  const sections: string[] = [
    `# ${docs.header ?? 'Information for AI'}`,
    AODI_LEGEND,
  ];
  const intro = await resolveText(docs.intro, 'intro', 'root.md');
  if (intro) sections.push(intro);

  const ungrouped = rules.filter(({ group }) => !group);
  if (ungrouped.length > 0) {
    const slot = docs.ungrouped;
    const text = await resolveText(slot?.text, 'ungrouped', 'root.md');
    sections.push(
      `## ${slot?.title ?? 'Rules'}`,
      ...(text ? [text] : []),
      list(ungrouped, 'root.md'),
    );
  }

  const files = new Map<string, string>();
  for (const group of groups) {
    const slot = docs.groups?.[group];
    const file = groupPath(group);
    const text = await resolveText(slot?.text, `groups "${group}"`, file, {
      group,
    });
    const title = slot?.title ?? `${group[0]?.toUpperCase()}${group.slice(1)}`;
    files.set(
      file,
      [
        `## ${title}`,
        ...(text ? [text] : []),
        list(
          rules.filter((rule) => rule.group === group),
          file,
        ),
      ].join('\n\n') + '\n',
    );
  }
  if (files.size > 0) {
    sections.push(
      '## Rule files',
      [...files.keys()]
        .map((file) => `- ${link('root.md', file, file)}`)
        .join('\n'),
    );
  }
  return { root: sections.join('\n\n') + '\n', groups: files };
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

  const refFrom =
    (from: string) =>
    (key: string): string => {
      if (!(key in refs)) {
        problems.push(`Rule instruction: unknown ref "${key}"`);
        return key;
      }
      return link(from, target(key), key);
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
  const resolveText: Resolve = async (text, label, from, meta) => {
    if (!text) return undefined;
    const docsRef = (key: string): string => {
      if (key in refs) return link(from, target(key), key);
      problems.push(`Docs ${label}: unknown ref "${key}"`);
      return key;
    };
    if (typeof text === 'function')
      return text({ ref: docsRef, ...meta }).trim();
    try {
      return (await readSource(configDir, text.file))
        .replace(REF, (_, key: string) => docsRef(key))
        .trim();
    } catch {
      problems.push(`Docs ${label}: missing file ${text.file}`);
      return undefined;
    }
  };
  const { root: markdown, groups: groupFiles } = await renderRules(
    rules,
    ({ id, instruction }, from) =>
      typeof instruction === 'function'
        ? instruction({ ref: refFrom(from) })
        : link(from, instructionPath(id), id),
    problems,
    config.docs ?? {},
    resolveText,
  );

  const [primary = DEFAULT_OUTPUT[0] as Output, ...others] =
    config.output ?? [];
  const primaryPath = join(projectRoot, primary.path, primary.root);
  files.set(primaryPath, markdown);
  for (const [from, text] of groupFiles) {
    files.set(join(projectRoot, primary.path, from), text);
  }
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

  if (config.settings) {
    const built = buildSettings(config.settings, primary.path, projectRoot);
    problems.push(...built.problems);
    for (const [file, text] of built.files) files.set(file, text);
  }

  const rulePaths = new Map(
    rules.map(({ id, group, instruction }) => [
      id,
      posix.join(
        primary.path.replaceAll('\\', '/'),
        typeof instruction === 'function'
          ? group
            ? groupPath(group)
            : primary.root
          : instructionPath(id),
      ),
    ]),
  );

  return { files, problems, rulePaths };
};
