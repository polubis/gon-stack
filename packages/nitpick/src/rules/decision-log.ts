import { fileURLToPath } from 'node:url';
import type { RuleUnit } from '../config.js';

type Options = { scopes: RegExp[] };
type Fields = Record<string, string | string[]>;
type Bounds = { min: number; max: number };

const DIR = 'decisions/';
const FILE = /^decisions\/(\d{4})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const WRONG_LOCATION = /(^|\/)__log__\//;
const SCOPE = /^[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)*$/;
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const TICKET = /^([A-Za-z][A-Za-z0-9]*-\d+|none)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER = /^\d{4}$/;
const UINT = /^\d+$/;
const DECIMAL = /^\d+(\.\d+)?$/;
const KEY = /^([A-Za-z][A-Za-z0-9]*):(?: (.*))?$/;
const ITEM = /^\s*- (.+)$/;
const BULLET = /^( *)- (\S.*)$/;
const PLAIN_START = /^[^"'[\]{}&*!|>%@`#,?:-]/;
const REQUIRED = ['ticket', 'scope', 'summary', 'why'];
const OPTIONAL = [
  'date',
  'supersedes',
  'tags',
  'models',
  'inputTokens',
  'outTokens',
  'cost',
  'workTimeInMinutes',
];
const LISTS = ['tags', 'models'];
const NUMBERS: Record<string, RegExp> = {
  inputTokens: UINT,
  outTokens: UINT,
  cost: DECIMAL,
  workTimeInMinutes: DECIMAL,
};
const SUMMARY: Bounds = { min: 10, max: 70 };
const WHY: Bounds = { min: 10, max: 200 };
const SLUG: Bounds = { min: 8, max: 60 };
const BULLETS: Bounds = { min: 1, max: 40 };
const LINE_MAX = 240;
const VERBS = [
  'add',
  'allow',
  'animate',
  'apply',
  'audit',
  'block',
  'build',
  'bump',
  'cap',
  'clarify',
  'clean',
  'derive',
  'drop',
  'extract',
  'fetch',
  'fix',
  'flatten',
  'float',
  'follow',
  'format',
  'harden',
  'hold',
  'isolate',
  'layer',
  'limit',
  'load',
  'make',
  'mark',
  'match',
  'merge',
  'migrate',
  'move',
  'normalize',
  'order',
  'pass',
  'pin',
  'place',
  'redesign',
  'redirect',
  'reduce',
  'refresh',
  'reload',
  'remember',
  'remove',
  'rename',
  'replace',
  'require',
  'restore',
  'restrict',
  'revert',
  'rewrite',
  'run',
  'save',
  'scan',
  'scope',
  'serialize',
  'set',
  'share',
  'shorten',
  'show',
  'simplify',
  'skip',
  'slim',
  'split',
  'stack',
  'store',
  'stub',
  'trim',
  'tweak',
  'unify',
  'update',
  'use',
  'wait',
  'wire',
];
const TEMPLATE = `decisions/NNNN-<scope-prefix>-<verb>-<object>.md
---
ticket: none
scope: parka/dashboard
summary: Tiles ordered by priority
why: Total + budget answer "am I OK?" first
date: 2026-10-11
supersedes: 0022
---

- Order: hero, limits, expenses, categories, chart
  - \`DashboardSkeleton\` mirrors the same order
- From \`xl\`: explicit \`xl:col-start\`/\`xl:row-start\``;

const isDate = (value: string): boolean =>
  DATE.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const scalar = (raw: string): string | undefined => {
  const value = raw.trim();
  if (value.startsWith('"')) {
    try {
      return JSON.parse(value) as string;
    } catch {
      return undefined;
    }
  }
  return PLAIN_START.test(value) &&
    !value.includes(': ') &&
    !value.includes(' #')
    ? value
    : undefined;
};

const parseFields = (lines: string[], problems: string[]): Fields => {
  const fields: Fields = {};
  let list: string[] | undefined;
  const read = (raw: string): string | undefined => {
    const value = scalar(raw);
    if (value === undefined)
      problems.push(
        `frontmatter: unsupported YAML value "${raw}", use a plain scalar without ": " / " #", or "double quotes"`,
      );
    return value;
  };
  for (const line of lines) {
    const item = ITEM.exec(line);
    const entry = KEY.exec(line);
    if (item && list) {
      const value = read(line.trim().slice(2));
      if (value !== undefined) list.push(value);
    } else if (entry) {
      const [, key = '', raw = ''] = entry;
      list = undefined;
      if (key in fields) {
        problems.push(`frontmatter: duplicate key "${key}"`);
      } else if (raw.trim() === '') {
        list = [];
        fields[key] = list;
      } else if (raw.startsWith('[') && raw.endsWith(']')) {
        fields[key] = raw
          .slice(1, -1)
          .split(',')
          .map(read)
          .filter((value) => value !== undefined);
      } else {
        const value = read(raw);
        if (value !== undefined) fields[key] = value;
      }
    } else {
      problems.push(
        `frontmatter: unsupported line "${line}", only "key: value" and "- item" lines are allowed`,
      );
    }
  }
  return fields;
};

const checkLength = (
  fields: Fields,
  key: string,
  bounds: Bounds,
  problems: string[],
): void => {
  const value = fields[key];
  if (
    typeof value === 'string' &&
    (value.length < bounds.min || value.length > bounds.max)
  )
    problems.push(
      `"${key}" must have ${bounds.min}-${bounds.max} characters, found ${value.length}`,
    );
};

const validateFields = (
  fields: Fields,
  existing: number[],
  { scopes }: Options,
  problems: string[],
): void => {
  for (const key of Object.keys(fields))
    if (!REQUIRED.includes(key) && !OPTIONAL.includes(key))
      problems.push(
        `unknown key "${key}", allowed: ${[...REQUIRED, ...OPTIONAL].join(', ')}`,
      );
  for (const key of REQUIRED)
    if (!(key in fields)) problems.push(`missing required key "${key}"`);
  for (const [key, value] of Object.entries(fields)) {
    if (LISTS.includes(key) !== Array.isArray(value))
      problems.push(
        LISTS.includes(key)
          ? `"${key}" must be a list: [a, b] or "- a" lines`
          : `"${key}" must be a single value, not a list`,
      );
    else if (Array.isArray(value) && value.length === 0)
      problems.push(`"${key}" must not be empty, remove the key instead`);
  }

  const { ticket, scope, date, supersedes, tags } = fields;
  if (typeof ticket === 'string' && !TICKET.test(ticket))
    problems.push(
      `"ticket" must be "none" or an id like ABC-123, found "${ticket}"`,
    );
  if (typeof scope === 'string') {
    if (!SCOPE.test(scope))
      problems.push(
        `"scope" must be lowercase kebab segments separated by "/", found "${scope}"`,
      );
    else if (!scopes.some((pattern) => pattern.test(scope)))
      problems.push(
        `"scope" "${scope}" is not allowed, allowed patterns: ${scopes.map(String).join(' ')}`,
      );
  }
  checkLength(fields, 'summary', SUMMARY, problems);
  checkLength(fields, 'why', WHY, problems);
  if (typeof date === 'string' && !isDate(date))
    problems.push(`"date" must be a real date YYYY-MM-DD, found "${date}"`);
  if (typeof supersedes === 'string' && !NUMBER.test(supersedes))
    problems.push(
      `"supersedes" must be a 4 digit number, found "${supersedes}"`,
    );
  else if (
    typeof supersedes === 'string' &&
    !existing.includes(Number(supersedes))
  )
    problems.push(`"supersedes" ${supersedes} does not exist in ${DIR}`);
  if (Array.isArray(tags))
    for (const tag of tags.filter((item) => !KEBAB.test(item)))
      problems.push(`tag "${tag}" must be kebab-case`);
  for (const [key, pattern] of Object.entries(NUMBERS)) {
    const value = fields[key];
    if (typeof value === 'string' && !pattern.test(value))
      problems.push(`"${key}" must be a non-negative number, found "${value}"`);
  }
};

const validateBody = (lines: string[], problems: string[]): void => {
  if (lines.length < BULLETS.min || lines.length > BULLETS.max)
    problems.push(
      `body must have ${BULLETS.min}-${BULLETS.max} bullet lines, found ${lines.length}`,
    );
  let level = -1;
  lines.forEach((line, index) => {
    const at = `body line ${index + 1}`;
    const bullet = BULLET.exec(line);
    if (!bullet) {
      problems.push(
        `${at}: only "- " list items are allowed (no headings, prose, code fences, blank lines or empty bullets)`,
      );
      return;
    }
    const [, indent = '', content = ''] = bullet;
    const depth = indent.length / 2;
    if (!Number.isInteger(depth) || depth > level + 1)
      problems.push(
        `${at}: nest with 2 spaces, at most one level deeper than the previous bullet`,
      );
    if (content.length > LINE_MAX)
      problems.push(
        `${at}: longer than ${LINE_MAX} characters, split it into nested bullets`,
      );
    level = Math.floor(depth);
  });
};

const validateName = (
  number: string,
  slug: string,
  existing: number[],
  scope: string | string[] | undefined,
  problems: string[],
): void => {
  const expected = Math.max(0, ...existing) + 1;
  if (Number(number) !== expected)
    problems.push(
      `file number must be the next free one: ${String(expected).padStart(4, '0')}, found ${number}`,
    );
  if (slug.length < SLUG.min || slug.length > SLUG.max)
    problems.push(
      `slug "${slug}" must have ${SLUG.min}-${SLUG.max} characters, found ${slug.length}`,
    );
  if (typeof scope !== 'string') return;
  const prefix = `${scope.split('/')[0]}-`;
  if (!slug.startsWith(prefix)) {
    problems.push(
      `slug "${slug}" must start with the scope prefix "${prefix}"`,
    );
    return;
  }
  const [verb = '', ...object] = slug.slice(prefix.length).split('-');
  if (!VERBS.includes(verb))
    problems.push(
      `slug "${slug}": after "${prefix}" put an imperative verb (${VERBS.slice(0, 6).join(', ')}, ...), found "${verb}"`,
    );
  if (object.length === 0)
    problems.push(`slug "${slug}": add an object after the verb "${verb}"`);
};

const validateEntry = (
  file: string,
  [number, slug]: [string, string],
  content: string,
  existing: number[],
  options: Options,
): string[] => {
  const problems: string[] = [];
  const lines = content.replaceAll('\r\n', '\n').split('\n');
  const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;

  if (end === -1) {
    problems.push(
      'file must start with a "---" YAML frontmatter block closed by "---"',
    );
  } else {
    const fields = parseFields(lines.slice(1, end), problems);
    validateFields(fields, existing, options, problems);
    validateName(number, slug, existing, fields['scope'], problems);
    if (lines[end + 1] !== '')
      problems.push('one blank line must follow the closing "---"');
    const body = lines.slice(end + 2);
    if (body.at(-1) === '') body.pop();
    else problems.push('file must end with a single newline');
    validateBody(body, problems);
  }

  return problems.map((problem) => `${file}: ${problem}`);
};

export const validateDecisionLog = (
  file: string,
  content: string,
  existing: number[],
  options: Options,
): string[] => {
  const match = FILE.exec(file);
  return match
    ? validateEntry(
        file,
        match.slice(1) as [string, string],
        content,
        existing,
        options,
      )
    : [
        `${file}: name must be "${DIR}NNNN-<scope-prefix>-<verb>-<object>.md" (kebab-case, [a-z0-9-])`,
      ];
};

export const decisionLog = (options: Options): RuleUnit => ({
  importance: 'A',
  fix: `Add exactly one new file to the commit and stage it (a commit that only moves or edits files in decisions/ needs none). Template:\n${TEMPLATE}\nSummary ${SUMMARY.min}-${SUMMARY.max} chars, why ${WHY.min}-${WHY.max} chars, slug ${SLUG.min}-${SLUG.max} chars, ${BULLETS.min}-${BULLETS.max} bullets of max ${LINE_MAX} chars. Allowed scopes: ${options.scopes.map(String).join(' ')}`,
  doc: {
    file: fileURLToPath(new URL('decision-log.md', import.meta.url)),
  },
  run: async ({ files, git, readText, report }) => {
    for (const file of git.stagedAddedFiles.filter((item) =>
      WRONG_LOCATION.test(item),
    ))
      report(
        `${file}: decisions live in "${DIR}" at repo root, not in "__log__/"`,
      );
    const entries = git.stagedAddedFiles.filter((file) => file.startsWith(DIR));
    const decisionsOnly =
      git.stagedFiles.length > 0 &&
      git.stagedFiles.every(
        (file) => file.startsWith(DIR) || WRONG_LOCATION.test(file),
      );
    if (entries.length === 0 && !decisionsOnly)
      report(`No new "${DIR}NNNN-slug.md" entry staged in this commit`);
    if (entries.length > 1)
      report(
        `Exactly one new "${DIR}NNNN-slug.md" entry per commit, found ${entries.length}: ${entries.join(', ')}`,
      );
    const existing = files
      .filter((file) => !entries.includes(file))
      .map((file) => FILE.exec(file)?.[1])
      .filter((number) => number !== undefined)
      .map(Number);
    for (const file of entries)
      for (const problem of validateDecisionLog(
        file,
        await readText(file),
        existing,
        options,
      ))
        report(problem);
  },
});
