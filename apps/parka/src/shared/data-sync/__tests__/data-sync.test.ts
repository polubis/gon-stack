import { afterEach, describe, expect, it, vi } from 'vitest';
import { watchDataChanges } from '../integration/data-sync';

class FakeEventSource {
  static all: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  closed = false;
  constructor() {
    FakeEventSource.all.push(this);
  }
  close() {
    this.closed = true;
  }
  emit(event: object) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }
}

type LockRequest = (
  name: string,
  options: { signal: AbortSignal },
  run: () => Promise<void>,
) => Promise<void>;

/** One lock held by whoever asked first; later requests wait for the release. */
const stubLocks = ({ granted }: { granted: boolean }) => {
  const request: LockRequest = (_name, { signal }, run) =>
    granted
      ? run()
      : new Promise((_, reject) =>
          signal.addEventListener('abort', () => reject(new Error('aborted'))),
        );
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: { request },
  });
};

const unsubscribers: (() => void)[] = [];
const watch = (domain: 'time' | 'finance', listener: () => void) => {
  const stop = watchDataChanges(domain, listener);
  unsubscribers.push(stop);
  return stop;
};

afterEach(() => {
  unsubscribers.splice(0).forEach((stop) => stop());
  FakeEventSource.all = [];
  Reflect.deleteProperty(navigator, 'locks');
  vi.unstubAllGlobals();
});

describe('data changes', () => {
  it('tells a watcher its domain changed', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const time = vi.fn();
    const finance = vi.fn();
    watch('time', time);
    watch('finance', finance);

    FakeEventSource.all[0]!.emit({ domain: 'time' });

    expect(time).toHaveBeenCalledTimes(1);
    expect(finance).not.toHaveBeenCalled();
  });

  it('shares one stream between all watchers', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    watch('time', vi.fn());
    watch('time', vi.fn());
    watch('finance', vi.fn());

    expect(FakeEventSource.all).toHaveLength(1);
  });

  it('closes the stream when nobody watches', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const stopA = watch('time', vi.fn());
    const stopB = watch('finance', vi.fn());

    stopA();
    expect(FakeEventSource.all[0]!.closed).toBe(false);
    stopB();

    expect(FakeEventSource.all[0]!.closed).toBe(true);
  });

  it('ignores a malformed notice', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const time = vi.fn();
    watch('time', time);

    FakeEventSource.all[0]!.emit({ domain: 'weather' });

    expect(time).not.toHaveBeenCalled();
  });

  it('reloads everything after the stream reconnects', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const time = vi.fn();
    watch('time', time);
    const stream = FakeEventSource.all[0]!;

    stream.onopen?.();
    expect(time).not.toHaveBeenCalled();
    stream.onopen?.();

    expect(time).toHaveBeenCalledTimes(1);
  });

  it('relays the notice to other tabs', async () => {
    stubLocks({ granted: true });
    vi.stubGlobal('EventSource', FakeEventSource);
    const otherTab = new BroadcastChannel('parka-data-sync');
    const heard = new Promise<unknown>((resolve) => {
      otherTab.onmessage = ({ data }) => resolve(data);
    });
    watch('time', vi.fn());
    await vi.waitFor(() => expect(FakeEventSource.all).toHaveLength(1));

    FakeEventSource.all[0]!.emit({ domain: 'finance' });

    expect(await heard).toBe('finance');
    otherTab.close();
  });

  it('hears a notice relayed by the tab holding the stream', async () => {
    stubLocks({ granted: false });
    vi.stubGlobal('EventSource', FakeEventSource);
    const time = vi.fn();
    watch('time', time);
    const leaderTab = new BroadcastChannel('parka-data-sync');

    leaderTab.postMessage('time');

    await vi.waitFor(() => expect(time).toHaveBeenCalledTimes(1));
    expect(FakeEventSource.all).toHaveLength(0);
    leaderTab.close();
  });
});
