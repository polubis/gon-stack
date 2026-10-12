export type Importance = 'A' | 'O' | 'D' | 'I';

export type CheckContext = {
  files: string[];
  readText: (file: string) => Promise<string>;
  git: {
    commitMessages: string[];
    stagedAddedFiles: string[];
    stagedFiles: string[];
    lastCommitMessages: (count: number) => Promise<string[]>;
  };
  report: (message: string) => void;
  meta: { ruleId: string; projectRoot: string };
};

type RuleBase<K extends string> = {
  id: string;
  group?: string;
  importance?: Importance;
  include?: string[];
  exclude?: string[];
  instruction:
    ((helpers: { ref: (key: K) => string }) => string) | { file: string };
};

export type Rule<K extends string = string> = RuleBase<K> &
  (
    | { check: (context: CheckContext) => void | Promise<void>; fix: string }
    | { check?: undefined; fix?: string }
  );

export type McpServer =
  | {
      type?: 'stdio';
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  | { type: 'http' | 'sse'; url: string; headers?: Record<string, string> };

export type Settings = {
  name?: 'settings.json' | 'settings.local.json';
  permissions?: {
    allow?: string[];
    ask?: string[];
    deny?: string[];
    defaultMode?: string;
    additionalDirectories?: string[];
  };
  hooks?: Record<string, unknown>;
  env?: Record<string, string>;
  mcp?: Record<string, McpServer>;
  [key: string]: unknown;
};

export type DocsText<K extends string> =
  | ((helpers: {
      ref: (key: K) => string;
      group?: string;
      importance?: Importance;
    }) => string)
  | { file: string };

type DocsSlot<K extends string> = { title?: string; text?: DocsText<K> };

export type Config<K extends string = string> = {
  docs?: {
    header?: string;
    intro?: DocsText<K>;
    ungrouped?: DocsSlot<K>;
    groups?: Record<string, DocsSlot<K>>;
    importances?: Partial<Record<Importance, DocsSlot<K>>>;
  };
  output?: { path: string; root: string }[];
  settings?: Settings;
  knowledge?: { dir?: string; refs?: Record<K, string> };
  rules:
    Rule<K>[] | ((helpers: { rule: (rule: Rule<K>) => Rule<K> }) => Rule<K>[]);
};

export const config = <K extends string = never>(value: Config<K>): Config<K> =>
  value;

export const resolveRules = <K extends string>(value: Config<K>): Rule<K>[] =>
  typeof value.rules === 'function'
    ? value.rules({ rule: (item) => item })
    : value.rules;
