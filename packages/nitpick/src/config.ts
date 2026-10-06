export type Importance = 'A' | 'O' | 'D' | 'I';

export type CheckContext = {
  files: string[];
  readText: (file: string) => Promise<string>;
  git: {
    commitMessages: string[];
    lastCommitMessages: (count: number) => Promise<string[]>;
  };
  report: (message: string) => void;
  meta: { ruleId: string; projectRoot: string };
};

export type Rule<K extends string = string> = {
  id: string;
  group?: string;
  importance?: Importance;
  include?: string[];
  exclude?: string[];
  instruction:
    ((helpers: { ref: (key: K) => string }) => string) | { file: string };
  check?: (context: CheckContext) => void | Promise<void>;
};

export type Config<K extends string = string> = {
  output?: { path: string; root: string }[];
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
