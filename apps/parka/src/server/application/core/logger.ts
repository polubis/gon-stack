import { APIError } from './error-handling';

const MAX_CAUSE_DEPTH = 5;

const serializeErrorForLog = (error: unknown, depth = 0): unknown => {
  if (depth > MAX_CAUSE_DEPTH) return '[Max cause depth]';

  if (error instanceof Error) {
    return {
      ...(APIError.is(error)
        ? error.json()
        : { name: error.name, message: error.message }),
      stack: error.stack,
      ...(error.cause !== undefined
        ? { cause: serializeErrorForLog(error.cause, depth + 1) }
        : {}),
    };
  }

  if (typeof error === 'object' && error !== null) {
    try {
      JSON.stringify(error);
      return error;
    } catch {
      return String(error);
    }
  }

  return error;
};

const LOG_PREFIX = 'LOGGER:';

const formatLogLine = (payload: string) => `${LOG_PREFIX} ${payload}`;

export const logger = (error: unknown, level: 'error' | 'warn') => {
  const line = formatLogLine(JSON.stringify(serializeErrorForLog(error)));
  if (level === 'error') console.error(line);
  else console.warn(line);
};
