import { describe, expect, it } from 'vitest';
import { renderStatusLine } from '../plugins/statusline-render.js';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const ANSI = new RegExp(`${String.fromCharCode(27)}[[0-9;]*m`, 'g');
const plain = (text: string): string => text.replace(ANSI, '');

const spend = (cost: number, tokens: number) => ({ cost, tokens });

const usage = (
  today: number,
  week: number,
  todayTokens = 0,
  weekTokens = 0,
) => ({
  today: spend(today, todayTokens),
  week: spend(week, weekTokens),
});

const window = (percent: number) => ({
  model: { display_name: 'Haiku 5.5' },
  context_window: { context_window_size: 100, used_percentage: percent },
});

describe('Status line renders when', () => {
  it('shows model with context, daily cost, daily and weekly share in order', () => {
    const text = renderStatusLine({
      session: {
        model: { display_name: 'Haiku 5.5' },
        context_window: { context_window_size: 200_000, used_percentage: 43 },
      },
      usage: usage(3.96, 65.5, 1_200_000, 3_100_000),
      limits: { daily: 20, weekly: 100 },
    });
    expect(plain(text)).toBe(
      'Haiku 5.5 ◔ 43% | $3.96/1.2M | td 20%/1.2M | wk 66%/3.1M',
    );
  });

  it('shows dashes for shares when no limits are configured', () => {
    const text = renderStatusLine({
      session: window(10),
      usage: usage(3.96, 65.5, 1_200_000, 3_100_000),
      limits: {},
    });
    expect(plain(text)).toBe(
      'Haiku 5.5 ○ 10% | $3.96/1.2M | td -/1.2M | wk -/3.1M',
    );
  });

  it('colors the share green, yellow or red by limit ratio', () => {
    const at = (today: number) =>
      renderStatusLine({
        session: window(10),
        usage: usage(today, 0),
        limits: { daily: 20 },
      });
    expect(at(5)).toContain(`${GREEN}25%${RESET}`);
    expect(at(15)).toContain(`${YELLOW}75%${RESET}`);
    expect(at(19)).toContain(`${RED}95%${RESET}`);
  });

  it('colors the context green up to half the window', () => {
    expect(
      renderStatusLine({ session: window(50), usage: null, limits: {} }),
    ).toContain(`${GREEN}◑ 50%${RESET}`);
  });

  it('colors the context yellow above half and red above 60%', () => {
    expect(
      renderStatusLine({ session: window(55), usage: null, limits: {} }),
    ).toContain(`${YELLOW}◑ 55%${RESET}`);
    expect(
      renderStatusLine({ session: window(61), usage: null, limits: {} }),
    ).toContain(`${RED}◑ 61%${RESET}`);
  });

  it('draws the gauge with one glyph per quarter of the window', () => {
    const glyph = (percent: number) =>
      plain(
        renderStatusLine({ session: window(percent), usage: null, limits: {} }),
      );
    expect(glyph(0)).toContain('○ 0%');
    expect(glyph(30)).toContain('◔ 30%');
    expect(glyph(55)).toContain('◑ 55%');
    expect(glyph(80)).toContain('◕ 80%');
    expect(glyph(100)).toContain('● 100%');
  });

  it('shows the context share from current usage when no percentage is given', () => {
    const text = renderStatusLine({
      session: {
        model: { display_name: 'Haiku 5.5' },
        context_window: {
          context_window_size: 200_000,
          current_usage: {
            input_tokens: 1_000,
            cache_creation_input_tokens: 1_000,
            cache_read_input_tokens: 83_000,
          },
        },
      },
      usage: null,
      limits: {},
    });
    expect(plain(text)).toBe('Haiku 5.5 ◔ 43% | usage n/a');
  });

  it('shows n/a for context when the window size is unknown', () => {
    const text = renderStatusLine({
      session: { model: { display_name: 'Haiku 5.5' } },
      usage: null,
      limits: {},
    });
    expect(plain(text)).toBe('Haiku 5.5 n/a | usage n/a');
  });

  it('names the model claude when the model is not reported', () => {
    const text = renderStatusLine({
      session: {
        context_window: { context_window_size: 100, used_percentage: 0 },
      },
      usage: null,
      limits: {},
    });
    expect(plain(text)).toMatch(/^claude ○ 0%/);
  });

  it('shows usage n/a instead of the cost and share parts when usage is missing', () => {
    const text = renderStatusLine({
      session: window(10),
      usage: null,
      limits: { daily: 20 },
    });
    expect(plain(text)).toBe('Haiku 5.5 ○ 10% | usage n/a');
    expect(text).toContain(`${DIM}usage n/a${RESET}`);
  });

  it('shows tokens in millions with one decimal', () => {
    const text = renderStatusLine({
      session: window(10),
      usage: usage(0, 0, 0, 2_600_000),
      limits: {},
    });
    expect(plain(text)).toContain('$0.00/0.0M');
    expect(plain(text)).toContain('wk -/2.6M');
  });

  it('separates the parts with a dim pipe', () => {
    const text = renderStatusLine({
      session: window(10),
      usage: usage(0, 0),
      limits: {},
    });
    expect(text).toContain(`${DIM} | ${RESET}`);
  });
});
