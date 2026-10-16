import { act, renderHook } from '@testing-library/react';
import { store } from '../store.js';

const create = () => store({ count: 1, name: 'a' });

describe('store', () => {
  it('exposes a value per key', () => {
    const s = create();

    expect(s.count$.get()).toBe(1);
    expect(s.name$.get()).toBe('a');
  });

  it('gets the whole state', () => {
    const s = create();

    expect(s.get()).toEqual({ count: 1, name: 'a' });
    expect(s.getInitial()).toEqual({ count: 1, name: 'a' });
  });

  it('returns same state reference until something changes', () => {
    const s = create();
    const before = s.get();

    expect(s.get()).toBe(before);

    s.count$.set(2);

    expect(s.get()).not.toBe(before);
    expect(s.get()).toEqual({ count: 2, name: 'a' });
  });

  it('sets the whole state', () => {
    const s = create();

    s.set({ count: 5, name: 'b' });

    expect(s.count$.get()).toBe(5);
    expect(s.name$.get()).toBe('b');
  });

  it('sets the whole state via updater', () => {
    const s = create();

    s.set((previous) => ({ ...previous, count: previous.count + 1 }));

    expect(s.get()).toEqual({ count: 2, name: 'a' });
  });

  it('resets every key', () => {
    const s = create();
    s.set({ count: 9, name: 'z' });

    s.reset();

    expect(s.get()).toEqual({ count: 1, name: 'a' });
  });

  it('notifies once per whole set with current and previous', () => {
    const s = create();
    const listener = vi.fn();
    s.subscribe(listener);

    s.set({ count: 2, name: 'b' });

    expect(listener).toHaveBeenCalledExactlyOnceWith(
      { count: 2, name: 'b' },
      { count: 1, name: 'a' },
    );
  });

  it('notifies when a single key changes', () => {
    const s = create();
    const listener = vi.fn();
    s.subscribe(listener);

    s.count$.set(3);

    expect(listener).toHaveBeenCalledExactlyOnceWith(
      { count: 3, name: 'a' },
      { count: 1, name: 'a' },
    );
  });

  it('skips notify when whole set changes nothing', () => {
    const s = create();
    const listener = vi.fn();
    s.subscribe(listener);

    s.set({ count: 1, name: 'a' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const s = create();
    const listener = vi.fn();

    s.subscribe(listener)();
    s.count$.set(2);

    expect(listener).not.toHaveBeenCalled();
  });

  it('rerenders whole hook on change', () => {
    const s = create();
    const { result } = renderHook(() => s());

    act(() => s.count$.set(2));

    expect(result.current).toEqual({ count: 2, name: 'a' });
  });

  it('rerenders key hook on change', () => {
    const s = create();
    const { result } = renderHook(() => s.count$());

    act(() => s.set({ count: 4, name: 'a' }));

    expect(result.current).toBe(4);
  });
});
