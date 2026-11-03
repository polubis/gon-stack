import {
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type Spend = { cost: number; tokens: number };
export type Usage = { today: Spend; week: Spend };

type FileState = {
  offset: number;
  total: number;
  last: number;
  days: Record<string, Spend>;
  // message id -> day key; a message is written once per content block
  ids: Record<string, string>;
};
type Cache = Record<string, FileState>;

type UsageLine = {
  message?: {
    id?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
};

const WEEK_DAYS = 7;
const NEWLINE = 0x0a;
const TIMESTAMP = /"timestamp":"([^"]+)"/;
const ZERO: Spend = { cost: 0, tokens: 0 };

const pad = (value: number): string => String(value).padStart(2, '0');

export const dayKey = (time: number): string => {
  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const daysBefore = (now: Date, count: number): Date =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - count);

// Local days, newest first: today, yesterday, ... (WEEK_DAYS entries).
const recentKeys = (now: Date): string[] =>
  Array.from({ length: WEEK_DAYS }, (_, index) =>
    dayKey(daysBefore(now, index).getTime()),
  );

const fresh = (): FileState => ({
  offset: 0,
  total: 0,
  last: 0,
  days: {},
  ids: {},
});

const addSpend = (
  days: Record<string, Spend>,
  key: string,
  delta: Spend,
): void => {
  const current = days[key] ?? ZERO;
  days[key] = {
    cost: current.cost + delta.cost,
    tokens: current.tokens + delta.tokens,
  };
};

// Transcript lines carry usage per message; cost comes from `cost-state` lines,
// whose cumulative `totalCostUSD` is attributed to the last timestamp before it.
const consume = (state: FileState, text: string): void => {
  for (const line of text.split('\n')) {
    if (line === '') continue;
    if (line.includes('"type":"cost-state"')) {
      const total =
        (JSON.parse(line) as { totalCostUSD?: number }).totalCostUSD ?? 0;
      // Cumulative counter: a drop means it restarted, so count it whole.
      const delta = total >= state.total ? total - state.total : total;
      if (state.last > 0) {
        addSpend(state.days, dayKey(state.last), { cost: delta, tokens: 0 });
      }
      state.total = total;
      continue;
    }
    const stamp = TIMESTAMP.exec(line)?.[1];
    if (stamp === undefined) continue;
    const time = Date.parse(stamp);
    if (Number.isNaN(time)) continue;
    state.last = time;
    if (line.includes('"usage":{')) {
      const message = (JSON.parse(line) as UsageLine).message;
      if (message?.id !== undefined) {
        if (message.id in state.ids) continue;
        state.ids[message.id] = dayKey(time);
      }
      const usage = message?.usage;
      const tokens = (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0);
      addSpend(state.days, dayKey(time), { cost: 0, tokens });
    }
  }
};

const readRange = async (
  file: string,
  start: number,
  end: number,
): Promise<Buffer> => {
  const handle = await open(file, 'r');
  try {
    const buffer = Buffer.alloc(end - start);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, start);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
};

// Reads only bytes appended since last run; a trailing partial line waits.
const advance = async (
  file: string,
  state: FileState,
  size: number,
): Promise<void> => {
  const chunk = await readRange(file, state.offset, size);
  const end = chunk.lastIndexOf(NEWLINE);
  if (end === -1) return;
  consume(state, chunk.subarray(0, end).toString('utf8'));
  state.offset += end + 1;
};

const transcripts = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return transcripts(path);
      return entry.name.endsWith('.jsonl') ? [path] : [];
    }),
  );
  return nested.flat();
};

const isState = (value: unknown): value is FileState => {
  if (value === null || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.offset === 'number' &&
    typeof state.total === 'number' &&
    typeof state.last === 'number' &&
    typeof state.days === 'object' &&
    state.days !== null &&
    typeof state.ids === 'object' &&
    state.ids !== null
  );
};

const loadCache = async (file: string): Promise<Cache> => {
  try {
    const parsed: unknown = JSON.parse(await readFile(file, 'utf8'));
    if (parsed === null || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isState(value)),
    );
  } catch {
    return {};
  }
};

const saveCache = async (file: string, cache: Cache): Promise<void> => {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(cache));
  await rename(temp, file);
};

const sumDays = (cache: Cache, keys: string[]): Spend => {
  let total = ZERO;
  for (const state of Object.values(cache)) {
    for (const key of keys) {
      const day = state.days[key];
      if (day)
        total = {
          cost: total.cost + day.cost,
          tokens: total.tokens + day.tokens,
        };
    }
  }
  return total;
};

// Scans Claude Code transcripts incrementally: the cache keeps a byte offset
// per file, so each run reads only what was appended since the last one.
export const readUsage = async ({
  projectsDir,
  cachePath,
  now,
}: {
  projectsDir: string;
  cachePath: string;
  now: Date;
}): Promise<Usage> => {
  const cache = await loadCache(cachePath);
  const keys = recentKeys(now);
  const oldest = dayKey(daysBefore(now, WEEK_DAYS - 1).getTime());
  const next: Cache = {};
  for (const file of await transcripts(projectsDir)) {
    const info = await stat(file);
    const previous = cache[file];
    const state = previous && previous.offset <= info.size ? previous : fresh();
    if (state.offset < info.size) await advance(file, state, info.size);
    for (const key of Object.keys(state.days)) {
      if (key < oldest) delete state.days[key];
    }
    for (const [id, key] of Object.entries(state.ids)) {
      if (key < oldest) delete state.ids[id];
    }
    next[file] = state;
  }
  await saveCache(cachePath, next);
  return {
    today: sumDays(next, keys.slice(0, 1)),
    week: sumDays(next, keys),
  };
};
