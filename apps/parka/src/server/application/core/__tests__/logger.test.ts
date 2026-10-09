import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequest,
  Conflict,
  InternalServer,
  Unauthorized,
} from '../error-handling';
import { logger } from '../logger';

const captureLog = (level: 'error' | 'warn') => {
  const spy =
    level === 'error'
      ? vi.spyOn(console, 'error').mockImplementation(() => {})
      : vi.spyOn(console, 'warn').mockImplementation(() => {});

  return {
    emit: (error: unknown) => logger(error, level),
    read: () => {
      const raw = spy.mock.calls[0]?.[0] as string;
      expect(raw.startsWith('LOGGER: ')).toBe(true);
      return JSON.parse(raw.slice('LOGGER: '.length)) as unknown;
    },
    raw: () => spy.mock.calls[0]?.[0] as string,
    spy,
  };
};

describe('procedure error logging', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('labels each line with LOGGER before the payload', () => {
    const log = captureLog('error');
    log.emit(new Error('boom'));
    expect(log.raw()).toMatch(/^LOGGER: /);
  });

  it('exposes the root cause behind an internal server error', () => {
    const log = captureLog('error');

    log.emit(new InternalServer(new Error('PARKA_AI_API_KEY is not set')));

    expect(log.spy).toHaveBeenCalledOnce();
    const parsed = log.read() as {
      code: number;
      type: string;
      message: string;
      cause: { message: string };
    };
    expect(parsed.code).toBe(500);
    expect(parsed.type).toBe('internal-server');
    expect(parsed.message).toBe('Internal Server Error');
    expect(parsed.cause.message).toBe('PARKA_AI_API_KEY is not set');
  });

  it('warns with bad-request details for invalid input', () => {
    const log = captureLog('warn');
    log.emit(new BadRequest(undefined, 'Invalid file'));
    expect(log.read()).toEqual(
      expect.objectContaining({
        code: 400,
        type: 'bad-request',
        message: 'Invalid file',
      }),
    );
  });

  it('warns with conflict details when an action is blocked', () => {
    const log = captureLog('warn');
    log.emit(new Conflict(undefined, 'In use'));
    expect(log.read()).toEqual(
      expect.objectContaining({
        code: 409,
        type: 'conflict',
        message: 'In use',
      }),
    );
  });

  it('records a plain thrown error by name and message', () => {
    const log = captureLog('error');
    log.emit(new Error('boom'));
    expect(log.read()).toMatchObject({ name: 'Error', message: 'boom' });
  });

  it('warns with unauthorized details and no empty cause field', () => {
    const log = captureLog('warn');
    log.emit(new Unauthorized(undefined));
    const parsed = log.read() as Record<string, unknown>;
    expect(parsed).not.toHaveProperty('cause');
    expect(parsed.code).toBe(401);
  });

  it('stops unwinding causes after a safe depth', () => {
    const root = new Error('root');
    let current: Error = root;
    for (let i = 0; i < 8; i += 1) {
      const next = new Error(`level-${i}`);
      current.cause = next;
      current = next;
    }

    const log = captureLog('error');
    log.emit(root);

    let node: unknown = log.read();
    expect(node).toMatchObject({ message: 'root' });

    for (let i = 0; i < 5; i += 1) {
      node = (node as { cause: unknown }).cause;
      expect(node).toMatchObject({ message: `level-${i}` });
    }

    node = (node as { cause: unknown }).cause;
    expect(node).toBe('[Max cause depth]');
  });

  it('keeps structured database errors attached as cause', () => {
    const log = captureLog('error');
    log.emit(new InternalServer({ code: '23503', message: 'db failure' }));
    expect((log.read() as { cause: { code: string } }).cause.code).toBe(
      '23503',
    );
  });

  it('still logs when the cause object is circular', () => {
    const circular: Record<string, unknown> = { tag: 'loop' };
    circular.self = circular;

    const log = captureLog('error');
    log.emit(new InternalServer(circular));
    expect((log.read() as { cause: unknown }).cause).toBe('[object Object]');
  });

  it('records an unexpected string failure', () => {
    const log = captureLog('error');
    log.emit('network down');
    expect(log.read()).toBe('network down');
  });

  it('records an unexpected numeric failure', () => {
    const log = captureLog('error');
    log.emit(503);
    expect(log.read()).toBe(503);
  });
});
