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

type Ctx<I extends string, K extends string> = {
  ref: (id: I) => string;
  file: (key: K) => string;
  insert: (key: K) => string;
};

type UnitIds<
  R extends Record<string, Record<string, unknown>>,
  A extends string,
> = { [G in keyof R]: keyof R[G] & string }[keyof R] | A;

type Doc<I extends string, K extends string> =
  string | { file: string } | ((ctx: Ctx<I, K>) => string);

type Check =
  | { run: (context: CheckContext) => void | Promise<void>; fix: string }
  | { run?: undefined; fix?: string };

type Output = {
  path: string;
  root: string;
  toc?: { agents?: boolean; skills?: boolean };
};

export type RuleUnit<I extends string = never, K extends string = never> = {
  importance: Importance;
  doc: Doc<I, K>;
  include?: string[];
  exclude?: string[];
} & Check;

export type EntryDoc<I extends string, K extends string> =
  string | { file: string } | ((ctx: Ctx<I, K> & { header: string }) => string);

type AgentUnit<I extends string, K extends string> = {
  doc: Doc<I, K>;
  frontmatter?: Record<string, string>;
};

type SkillUnit = { source: string };

export type Config = {
  settings?: Settings;
  entry?: { doc: EntryDoc<string, string> };
  rules: Record<string, Record<string, RuleUnit<string, string>>>;
  agents?: Record<string, AgentUnit<string, string>>;
  skills?: Record<string, SkillUnit>;
  refs?: Record<string, string>;
  output?: Output[];
};

export type ListedRule = RuleUnit<string, string> & {
  id: string;
  group: string;
};

export const listRules = (value: Config): ListedRule[] =>
  Object.entries(value.rules).flatMap(([group, units]) =>
    Object.entries(units).map(([id, unit]) => ({ ...unit, id, group })),
  );

export const config = <
  const R extends Record<string, Record<string, unknown>>,
  const A extends string = never,
  const S extends string = never,
  const F extends Record<string, string> = Record<never, never>,
>(value: {
  settings?: Settings;
  entry?: { doc: EntryDoc<UnitIds<R, A | S>, keyof F & string> };
  rules: {
    [G in keyof R]: {
      [I in keyof R[G]]: RuleUnit<UnitIds<R, A | S>, keyof F & string>;
    };
  };
  agents?: { [I in A]: AgentUnit<UnitIds<R, A | S>, keyof F & string> };
  skills?: { [I in S]: SkillUnit };
  refs?: F;
  output?: Output[];
}): Config => {
  const result = value as unknown as Config;
  const seen = new Set<string>();
  for (const id of [
    ...listRules(result).map((rule) => rule.id),
    ...Object.keys(result.agents ?? {}),
    ...Object.keys(result.skills ?? {}),
  ]) {
    if (seen.has(id)) throw new Error(`Duplicate unit id "${id}"`);
    seen.add(id);
  }
  return result;
};
