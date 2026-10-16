import { readFileSync } from 'node:fs';
import { basename, dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listRules } from './config.js';
import type { Config, EntryDoc } from './config.js';
import { buildSettings } from './settings.js';

type Docs = {
  files: Map<string, string>;
  problems: string[];
  rulePaths: Map<string, string>;
};

type Output = { path: string; root: string };

const DEFAULT_OUTPUT: Output[] = [{ path: '.ai', root: 'AGENTS.md' }];
const REF = /\{\{ref:([^}\s]+)\}\}/g;

const BACKSLASH = String.fromCharCode(92);

const readSource = (configDir: string, file: string): string =>
  readFileSync(resolve(configDir, file), 'utf8').replaceAll('\r\n', '\n');

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^(#{1,5})(\s)/;

const shiftHeadings = (text: string): string => {
  let fenced = false;
  return text
    .split('\n')
    .map((line) => {
      if (FENCE.test(line)) fenced = !fenced;
      return fenced ? line : line.replace(HEADING, '$1#$2');
    })
    .join('\n');
};

export const AODI_LEGEND = readSource(
  fileURLToPath(new URL('rules/aodi-framework.md', import.meta.url)),
  '.',
).trim();

const instructionPath = (id: string): string => posix.join('rules', `${id}.md`);

const keysIn = (text: string): string[] =>
  [...text.matchAll(REF)].map((match) => match[1] as string);

const link = (from: string, to: string, label: string): string =>
  `[${label}](${posix.relative(posix.dirname(from), to)})`;

const readSources = (
  refs: Record<string, string>,
  configDir: string,
  problems: string[],
): Map<string, string> => {
  const sources = new Map<string, string>();
  for (const [key, source] of Object.entries(refs)) {
    try {
      sources.set(key, readSource(configDir, source));
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

type Doc = EntryDoc<string, string>;

const GROUP_NAME = /^[\w-]+$/;

const agentPath = (id: string): string => posix.join('agents', `${id}.md`);

const groupPath = (group: string): string => posix.join('rules', `${group}.md`);

export const buildDocs = (
  config: Config,
  configDir: string,
  projectRoot: string,
): Docs => {
  const problems: string[] = [];
  const files = new Map<string, string>();
  const refs = config.refs ?? {};
  const target = (key: string): string => posix.join('references', `${key}.md`);

  const sources = readSources(refs, configDir, problems);
  problems.push(...validateRefs(refs, sources));

  const [primary = DEFAULT_OUTPUT[0] as Output, ...others] =
    config.output ?? [];
  const rules = listRules(config);
  const agents = Object.entries(config.agents ?? {}).map(([id, unit]) => ({
    ...unit,
    id,
  }));
  const unitTargets = new Map<string, string>([
    ...rules.map(({ id, group, doc }): [string, string] => [
      id,
      typeof doc === 'object' ? instructionPath(id) : groupPath(group),
    ]),
    ...agents.map(({ id }): [string, string] => [id, agentPath(id)]),
  ]);

  const resolveDoc = (
    doc: Doc,
    label: string,
    from: string,
    extra = { header: '' },
  ): string | undefined => {
    if (typeof doc === 'string') return doc;
    const read = (path: string): string | undefined => {
      try {
        return readSource(configDir, path);
      } catch {
        problems.push(`${label}: missing file ${path}`);
        return undefined;
      }
    };
    const unknown = (key: string): string => {
      problems.push(`${label}: unknown ref "${key}"`);
      return key;
    };
    const ctx = {
      ref: (id: string): string => {
        const to = unitTargets.get(id);
        return to === undefined ? unknown(id) : link(from, to, id);
      },
      file: (key: string): string =>
        key in refs ? link(from, target(key), key) : unknown(key),
      insert: (key: string): string => {
        if (!(key in refs)) return unknown(key);
        return shiftHeadings(sources.get(key) ?? '')
          .replace(REF, (_, ref: string) => ctx.file(ref))
          .trim();
      },
      ...extra,
    };
    if (typeof doc === 'function') return doc(ctx);
    return read(doc.file)?.replace(REF, (_, key: string) => ctx.file(key));
  };

  const ids = new Set<string>();
  for (const { id } of [...rules, ...agents]) {
    if (ids.has(id)) problems.push(`Duplicate id "${id}"`);
    ids.add(id);
  }
  for (const group of Object.keys(config.rules)) {
    if (!GROUP_NAME.test(group)) {
      problems.push(`Group "${group}": use letters, digits, "_" or "-"`);
    }
    if (ids.has(group)) {
      problems.push(`Group "${group}": same name as a rule id file`);
    }
  }

  const instructionFiles = new Map<string, string>();
  for (const { id, doc, run, fix } of rules) {
    if (run && !fix) {
      problems.push(`Rule "${id}": fix is required when run is defined`);
    }
    if (typeof doc !== 'object') continue;
    const text = resolveDoc(doc, `Rule "${id}"`, instructionPath(id));
    if (text !== undefined) instructionFiles.set(instructionPath(id), text);
  }

  const list = (group: string, from: string): string =>
    rules
      .filter((rule) => rule.group === group)
      .map(
        (rule, index) =>
          `${index + 1}. (${rule.importance}) ${
            typeof rule.doc === 'object'
              ? link(from, instructionPath(rule.id), rule.id)
              : resolveDoc(rule.doc, `Rule "${rule.id}"`, from)
          }`,
      )
      .join('\n');

  const header = '# Information for AI';
  const entry = config.entry
    ? resolveDoc(config.entry.doc, 'Entry', 'root.md', { header })
    : undefined;
  const sections: string[] = config.entry ? [(entry ?? '').trim()] : [header];

  const groupFiles = new Map<string, string>();
  for (const group of Object.keys(config.rules)) {
    const file = groupPath(group);
    const title = group
      .split('-')
      .map((word) => `${word[0]?.toUpperCase()}${word.slice(1)}`)
      .join(' ');
    groupFiles.set(file, `## ${title}\n\n${list(group, file)}\n`);
  }
  if (groupFiles.size > 0) {
    sections.push(
      '## Rule files',
      AODI_LEGEND,
      [...groupFiles.keys()]
        .map((file) => `- ${link('root.md', file, file)}`)
        .join('\n'),
    );
  }
  if (agents.length > 0) {
    const agentFiles = agents.map(({ id }) => agentPath(id));
    sections.push(
      '## Agent files',
      agentFiles.map((file) => `- ${link('root.md', file, file)}`).join('\n'),
    );
    for (const [index, { id, doc, frontmatter }] of agents.entries()) {
      const file = agentFiles[index] as string;
      const head = frontmatter
        ? `---\n${Object.entries(frontmatter)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}\n---\n\n`
        : '';
      const body = resolveDoc(doc, `Agent "${id}"`, file)?.trim() ?? '';
      groupFiles.set(file, `${head}${body}\n`);
    }
  }
  if (sources.size > 0) {
    sections.push(
      '## Reference files',
      [...sources.keys()]
        .map((key) => `- ${link('root.md', target(key), target(key))}`)
        .join('\n'),
    );
  }

  const primaryPath = join(projectRoot, primary.path, primary.root);
  files.set(primaryPath, sections.join('\n\n') + '\n');
  for (const [from, text] of groupFiles) {
    files.set(join(projectRoot, primary.path, from), text);
  }
  for (const [from, text] of instructionFiles) {
    files.set(join(projectRoot, primary.path, from), text);
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
    const to = relative(dirname(file), primaryPath).replaceAll(BACKSLASH, '/');
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
    [...unitTargets]
      .filter(([id]) => rules.some((rule) => rule.id === id))
      .map(([id, path]) => [
        id,
        posix.join(primary.path.replaceAll(BACKSLASH, '/'), path),
      ]),
  );

  return { files, problems, rulePaths };
};
