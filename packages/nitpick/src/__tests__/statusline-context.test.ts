import { describe, expect, it } from 'vitest';
import { contextUsage } from '../plugins/statusline-context.js';

describe('Context usage works when', () => {
  it('is unknown without a window size', () => {
    expect(contextUsage(undefined)).toBeNull();
    expect(contextUsage({ used_percentage: 10 })).toBeNull();
    expect(contextUsage({ context_window_size: 0 })).toBeNull();
  });

  it('takes the percentage from Claude Code when given', () => {
    expect(
      contextUsage({ context_window_size: 1_000, used_percentage: 40 }),
    ).toEqual({ percent: 40, used: 400, size: 1_000 });
  });

  it('counts all cached and fresh input tokens of the last request', () => {
    expect(
      contextUsage({
        context_window_size: 200_000,
        current_usage: {
          input_tokens: 1_000,
          cache_creation_input_tokens: 1_000,
          cache_read_input_tokens: 83_000,
        },
      }),
    ).toEqual({ percent: 42.5, used: 85_000, size: 200_000 });
  });

  it('counts only the token fields that are present', () => {
    expect(
      contextUsage({
        context_window_size: 1_000,
        current_usage: { input_tokens: 100 },
      }),
    ).toEqual({ percent: 10, used: 100, size: 1_000 });
    expect(
      contextUsage({
        context_window_size: 1_000,
        current_usage: { cache_creation_input_tokens: 100 },
      }),
    ).toEqual({ percent: 10, used: 100, size: 1_000 });
    expect(
      contextUsage({
        context_window_size: 1_000,
        current_usage: { cache_read_input_tokens: 250 },
      }),
    ).toEqual({ percent: 25, used: 250, size: 1_000 });
  });

  it('starts at zero before any request', () => {
    expect(contextUsage({ context_window_size: 1_000 })).toEqual({
      percent: 0,
      used: 0,
      size: 1_000,
    });
  });

  it('derives used tokens from the percentage when no usage is given', () => {
    expect(
      contextUsage({ context_window_size: 1_000, used_percentage: 50 }),
    ).toEqual({ percent: 50, used: 500, size: 1_000 });
  });

  it('keeps the percentage between 0 and 100', () => {
    expect(
      contextUsage({ context_window_size: 100, used_percentage: 130 })?.percent,
    ).toBe(100);
    expect(
      contextUsage({ context_window_size: 100, used_percentage: -5 })?.percent,
    ).toBe(0);
  });
});
