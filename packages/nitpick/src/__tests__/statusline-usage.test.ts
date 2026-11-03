import { mkdir, mkdtemp, appendFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readUsage } from '../plugins/statusline-usage.js';

// "now" is 2026-11-03 15:00 local. daysAgo 0 = today, 6 = oldest day in the week.
const NOW = new Date(2026, 10, 3, 15);
const at = (daysAgo: number, hour = 12): string =>
  new Date(2026, 10, 3 - daysAgo, hour).toISOString();

const stamp = (daysAgo: number) => JSON.stringify({ timestamp: at(daysAgo) });
const cost = (total: number) =>
  JSON.stringify({ type: 'cost-state', totalCostUSD: total });
const message = (
  id: string | null,
  daysAgo: number,
  input: number,
  output: number,
) =>
  JSON.stringify({
    timestamp: at(daysAgo),
    message: {
      ...(id === null ? {} : { id }),
      usage: { input_tokens: input, output_tokens: output },
    },
  });

const setup = async () => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-usage-'));
  const projectsDir = join(root, 'projects');
  const cachePath = join(root, 'cache', 'usage.json');
  await mkdir(join(projectsDir, 'p1'), { recursive: true });
  return {
    projectsDir,
    cachePath,
    session: join(projectsDir, 'p1', 's1.jsonl'),
    read: () => readUsage({ projectsDir, cachePath, now: NOW }),
  };
};

const lines = (...rows: string[]) => `${rows.join('\n')}\n`;

describe('Status line usage works when', () => {
  it('counts cost on the day each session counter moved', async () => {
    const env = await setup();
    await writeFile(
      env.session,
      lines(stamp(0), cost(1.5), stamp(1), cost(2), stamp(7), cost(3)),
    );
    const usage = await env.read();
    expect(usage.today.cost).toBeCloseTo(1.5);
    expect(usage.week.cost).toBeCloseTo(2);
  });

  it('counts a restarted session counter as a whole new amount', async () => {
    const env = await setup();
    await writeFile(env.session, lines(stamp(0), cost(2), cost(0.4)));
    expect((await env.read()).today.cost).toBeCloseTo(2.4);
  });

  it('ignores counter lines that come before any timestamp', async () => {
    const env = await setup();
    await writeFile(env.session, lines(cost(5), stamp(0), cost(6)));
    expect((await env.read()).today.cost).toBeCloseTo(1);
  });

  it('treats a counter line without a total as zero', async () => {
    const env = await setup();
    await writeFile(env.session, lines(stamp(0), '{"type":"cost-state"}'));
    expect((await env.read()).today.cost).toBe(0);
  });

  it('counts each message id once and ignores blank or untimed lines', async () => {
    const env = await setup();
    await writeFile(
      env.session,
      `${lines(
        message('m1', 0, 100, 50),
        message('m1', 0, 100, 50),
        message('m2', 3, 10, 5),
        '{"type":"summary"}',
        message('m3', 0, 1, 1).replace(
          /"timestamp":"[^"]+"/,
          '"timestamp":"nope"',
        ),
      )}\n`,
    );
    const usage = await env.read();
    expect(usage.today.tokens).toBe(150);
    expect(usage.week.tokens).toBe(165);
  });

  it('counts usage lines without an id every time they appear', async () => {
    const env = await setup();
    await writeFile(
      env.session,
      lines(message(null, 0, 7, 3), message(null, 0, 7, 3)),
    );
    expect((await env.read()).today.tokens).toBe(20);
  });

  it('reads only what was appended since the last run', async () => {
    const env = await setup();
    await writeFile(env.session, lines(stamp(0), cost(1)));
    expect((await env.read()).today.cost).toBeCloseTo(1);
    await appendFile(env.session, lines(stamp(0), cost(1.25)));
    expect((await env.read()).today.cost).toBeCloseTo(1.25);
    expect((await env.read()).today.cost).toBeCloseTo(1.25);
  });

  it('waits for a partial last line before counting it', async () => {
    const env = await setup();
    await writeFile(env.session, lines(stamp(0), cost(1)));
    expect((await env.read()).today.cost).toBeCloseTo(1);
    await appendFile(env.session, '{"type":"cost-state","totalCostUSD":2');
    expect((await env.read()).today.cost).toBeCloseTo(1);
    await appendFile(env.session, '}\n');
    expect((await env.read()).today.cost).toBeCloseTo(2);
  });

  it('starts over when a transcript shrinks', async () => {
    const env = await setup();
    await writeFile(env.session, lines(stamp(0), cost(4), stamp(0), cost(4.5)));
    expect((await env.read()).today.cost).toBeCloseTo(4.5);
    await writeFile(env.session, lines(stamp(0), cost(0.5)));
    expect((await env.read()).today.cost).toBeCloseTo(0.5);
  });

  it('reads transcripts in nested folders and skips other files', async () => {
    const env = await setup();
    await mkdir(join(env.projectsDir, 'p1', 'sub'), { recursive: true });
    await writeFile(
      join(env.projectsDir, 'p1', 'sub', 's2.jsonl'),
      lines(stamp(0), cost(0.75)),
    );
    await writeFile(
      join(env.projectsDir, 'p1', 'notes.txt'),
      lines(stamp(0), cost(9)),
    );
    expect((await env.read()).today.cost).toBeCloseTo(0.75);
  });

  it('reports zero when the projects folder is missing', async () => {
    const env = await setup();
    const missing = await readUsage({
      projectsDir: join(env.projectsDir, 'nope'),
      cachePath: env.cachePath,
      now: NOW,
    });
    expect(missing.week.cost).toBe(0);
  });

  it('counts usage that has no message id or token fields', async () => {
    const env = await setup();
    await writeFile(
      env.session,
      lines(
        '{"timestamp":"' + at(0) + '","toolUseResult":{"usage":{}}}',
        '{"timestamp":"' + at(0) + '","message":{"id":"e","usage":{}}}',
      ),
    );
    expect((await env.read()).today.tokens).toBe(0);
  });

  it('reports zero when there are no transcripts', async () => {
    const env = await setup();
    expect(await env.read()).toEqual({
      today: { cost: 0, tokens: 0 },
      week: { cost: 0, tokens: 0 },
    });
  });

  it('recovers from a cache that is not valid', async () => {
    const env = await setup();
    await mkdir(join(env.cachePath, '..'), { recursive: true });
    await writeFile(env.cachePath, 'not json');
    await writeFile(env.session, lines(stamp(0), cost(1)));
    expect((await env.read()).today.cost).toBeCloseTo(1);
  });

  it('drops cache entries with the wrong shape', async () => {
    const env = await setup();
    await mkdir(join(env.cachePath, '..'), { recursive: true });
    await writeFile(
      env.cachePath,
      JSON.stringify({ [env.session]: { offset: 'x' }, other: null }),
    );
    await writeFile(env.session, lines(stamp(0), cost(1)));
    expect((await env.read()).today.cost).toBeCloseTo(1);
  });

  it('treats a cache that is not an object as empty', async () => {
    const env = await setup();
    await mkdir(join(env.cachePath, '..'), { recursive: true });
    await writeFile(env.cachePath, 'null');
    await writeFile(env.session, lines(stamp(0), cost(1)));
    expect((await env.read()).today.cost).toBeCloseTo(1);
  });

  it('forgets days older than the week', async () => {
    const env = await setup();
    await writeFile(
      env.session,
      lines(stamp(30), cost(5), message('old', 30, 1, 1), stamp(0), cost(6)),
    );
    expect((await env.read()).week.cost).toBeCloseTo(1);
    const cache = await import('node:fs/promises').then((fs) =>
      fs.readFile(env.cachePath, 'utf8'),
    );
    expect(cache).not.toContain('2026-10-04');
  });
});
