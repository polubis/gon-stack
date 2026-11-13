import { afterEach, describe, expect, it, vi } from 'vitest';
import { watchDataChanges } from '../integration/data-sync';

class FakeEventSource {
  static all: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  closed = false;
  static CLOSED = 2;
  readyState = 1;
  onerror: (() => void) | null = null;
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

const unsubscribers: (() => void)[] = [];
const watch = (domain: 'time' | 'finance', listener: () => void) => {
  const stop = watchDataChanges(domain, listener);
  unsubscribers.push(stop);
  return stop;
};

afterEach(() => {
  unsubscribers.splice(0).forEach((stop) => stop());
  FakeEventSource.all = [];
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

  it('reopens a stream the browser closed', () => {
    vi.useFakeTimers();
    vi.stubGlobal('EventSource', FakeEventSource);
    watch('time', vi.fn());
    const stream = FakeEventSource.all[0]!;

    stream.readyState = FakeEventSource.CLOSED;
    stream.onerror?.();
    vi.advanceTimersByTime(3000);
    vi.useRealTimers();

    expect(FakeEventSource.all).toHaveLength(2);
  });

  it('reloads and reopens when the phone screen comes back', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const time = vi.fn();
    watch('time', time);
    FakeEventSource.all[0]!.onopen?.();

    document.dispatchEvent(new Event('visibilitychange'));

    expect(time).toHaveBeenCalledTimes(1);
    expect(FakeEventSource.all).toHaveLength(2);
    expect(FakeEventSource.all[0]!.closed).toBe(true);
  });

  it('gives every tab its own stream', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const stop = watchDataChanges('time', vi.fn());
    stop();
    const stopAgain = watchDataChanges('time', vi.fn());
    unsubscribers.push(stopAgain);

    expect(FakeEventSource.all).toHaveLength(2);
  });
});
