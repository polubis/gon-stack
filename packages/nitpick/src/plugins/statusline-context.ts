export type ContextInput = {
  context_window_size?: number;
  used_percentage?: number | null;
  current_usage?: {
    input_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  } | null;
};

export type Context = { percent: number; used: number; size: number };

const sumUsage = (usage: NonNullable<ContextInput['current_usage']>): number =>
  (usage.input_tokens ?? 0) +
  (usage.cache_creation_input_tokens ?? 0) +
  (usage.cache_read_input_tokens ?? 0);

// Prefers Claude Code's own used_percentage; falls back to the last request's
// tokens over the window size. Null when the window size is unknown.
export const contextUsage = (
  input: ContextInput | undefined,
): Context | null => {
  const size = input?.context_window_size;
  if (input === undefined || size === undefined || size <= 0) return null;
  const fromUsage = input.current_usage
    ? sumUsage(input.current_usage)
    : undefined;
  const percent = Math.min(
    100,
    Math.max(0, input.used_percentage ?? ((fromUsage ?? 0) / size) * 100),
  );
  const used = fromUsage ?? Math.round((percent / 100) * size);
  return { percent, used, size };
};
