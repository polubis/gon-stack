import { contextUsage } from './statusline-context.js';
import type { ContextInput } from './statusline-context.js';
import type { Spend, Usage } from './statusline-usage.js';

export type SessionInput = {
  model?: { display_name?: string };
  context_window?: ContextInput;
};

export type Limits = { daily?: number; weekly?: number };

const ESC = '\x1b[';
const DIM = '2';

const paint = (code: string, text: string): string =>
  `${ESC}${code}m${text}${ESC}0m`;

const money = (value: number): string => `$${value.toFixed(2)}`;

const millions = (value: number): string =>
  `${(value / 1_000_000).toFixed(1)}M`;

// Limits: green below 70%, yellow below 90%, red from there on.
const tone = (ratio: number): string => {
  if (ratio >= 0.9) return '31';
  if (ratio >= 0.7) return '33';
  return '32';
};

// Context: green up to 50% of the window, yellow up to 60%, red above.
const contextTone = (percent: number): string => {
  if (percent > 60) return '31';
  if (percent > 50) return '33';
  return '32';
};

// Circular gauge: one glyph per quarter of the window.
const RING = ['○', '◔', '◑', '◕', '●'];

const ring = (percent: number): string =>
  RING[Math.min(4, Math.floor(percent / 25))] as string;

// Model, gauge and share of the context window taken.
const contextPart = (session: SessionInput): string => {
  const name = session.model?.display_name ?? 'claude';
  const usage = contextUsage(session.context_window);
  if (usage === null) return `${name} ${paint(DIM, 'n/a')}`;
  const figure = `${ring(usage.percent)} ${Math.round(usage.percent)}%`;
  return `${name} ${paint(contextTone(usage.percent), figure)}`;
};

// Daily cost and tokens, no limit shown.
const dailyPart = (spend: Spend): string =>
  `${money(spend.cost)}/${millions(spend.tokens)}`;

// Share of a limit used, with tokens. "-" when no limit is configured.
const limitPart = (
  label: string,
  spend: Spend,
  limit: number | undefined,
): string => {
  if (limit === undefined) return `${label} -/${millions(spend.tokens)}`;
  const ratio = spend.cost / limit;
  const figure = paint(tone(ratio), `${Math.round(ratio * 100)}%`);
  return `${label} ${figure}/${millions(spend.tokens)}`;
};

export const renderStatusLine = ({
  session,
  usage,
  limits,
}: {
  session: SessionInput;
  usage: Usage | null;
  limits: Limits;
}): string => {
  const parts = [contextPart(session)];
  if (usage === null) {
    parts.push(paint(DIM, 'usage n/a'));
  } else {
    parts.push(
      dailyPart(usage.today),
      limitPart('td', usage.today, limits.daily),
      limitPart('wk', usage.week, limits.weekly),
    );
  }
  return parts.join(paint(DIM, ' | '));
};
