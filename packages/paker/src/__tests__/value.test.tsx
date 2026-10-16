import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { value } from '../value.js';

describe('value', () => {
  it('returns initial value', () => {
    const count$ = value(1);

    expect(count$.get()).toBe(1);
    expect(count$.getInitial()).toBe(1);
  });

  it('sets a new value', () => {
    const count$ = value(1);

    count$.set(2);

    expect(count$.get()).toBe(2);
  });

  it('sets via updater', () => {
    const count$ = value(1);

    count$.set((previous) => previous + 1);

    expect(count$.get()).toBe(2);
  });

  it('resets to initial', () => {
    const count$ = value(1);
    count$.set(5);

    count$.reset();

    expect(count$.get()).toBe(1);
  });

  it('notifies with current and previous', () => {
    const count$ = value(1);
    const listener = vi.fn();
    count$.subscribe(listener);

    count$.set(2);

    expect(listener).toHaveBeenCalledExactlyOnceWith(2, 1);
  });

  it('skips notify when value is the same', () => {
    const count$ = value(1);
    const listener = vi.fn();
    count$.subscribe(listener);

    count$.set(1);

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const count$ = value(1);
    const listener = vi.fn();
    const unsubscribe = count$.subscribe(listener);

    unsubscribe();
    count$.set(2);

    expect(listener).not.toHaveBeenCalled();
  });

  it('runs lazy initializer once and only when first read', () => {
    const init = vi.fn(() => ({ a: 1 }));
    const obj$ = value(init);

    expect(init).not.toHaveBeenCalled();
    const first = obj$.get();
    obj$.set({ a: 2 });
    obj$.reset();

    expect(init).toHaveBeenCalledOnce();
    expect(obj$.get()).toBe(first);
    expect(obj$.getInitial()).toBe(first);
  });

  it('runs lazy initializer on set before any read', () => {
    const obj$ = value(() => 1);

    obj$.set(2);

    expect(obj$.getInitial()).toBe(1);
    expect(obj$.get()).toBe(2);
  });
});

describe('value hook', () => {
  it('rerenders on change', () => {
    const count$ = value(1);
    const { result } = renderHook(() => count$());

    act(() => count$.set(2));

    expect(result.current).toBe(2);
  });

  it('renders initial value on the server', () => {
    const count$ = value(1);
    count$.set(2);
    const View = () => createElement('span', null, count$());

    expect(renderToString(createElement(View))).toContain('>1<');
  });
});

describe('value keys', () => {
  it('gets and sets object key immutably', () => {
    const user$ = value({ name: 'a', age: 1 });
    const before = user$.get();

    user$.setKey('name', 'b');

    expect(user$.getKey('name')).toBe('b');
    expect(user$.get()).toEqual({ name: 'b', age: 1 });
    expect(before).toEqual({ name: 'a', age: 1 });
  });

  it('sets key via updater', () => {
    const user$ = value({ name: 'a', age: 1 });

    user$.setKey('age', (age) => age + 1);

    expect(user$.getKey('age')).toBe(2);
  });

  it('sets array item immutably', () => {
    const list$ = value([1, 2, 3]);
    const before = list$.get();

    list$.setKey(1, 20);

    expect(list$.get()).toEqual([1, 20, 3]);
    expect(before).toEqual([1, 2, 3]);
    expect(list$.getKey(1)).toBe(20);
  });

  it('skips update when key is unchanged', () => {
    const user$ = value({ name: 'a' });
    const listener = vi.fn();
    user$.subscribe(listener);

    user$.setKey('name', 'a');

    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies key subscribers only when that key changes', () => {
    const user$ = value({ name: 'a', age: 1 });
    const name = vi.fn();
    user$.subscribeKey('name', name);

    user$.setKey('age', 2);
    user$.setKey('name', 'b');

    expect(name).toHaveBeenCalledExactlyOnceWith('b', 'a');
  });
});

describe('computed value', () => {
  it('derives from many values', () => {
    const a$ = value(1);
    const b$ = value(2);
    const sum$ = value([a$, b$], (a, b) => a + b);

    expect(sum$.get()).toBe(3);

    a$.set(5);

    expect(sum$.get()).toBe(7);
  });

  it('computes once per dependency change', () => {
    const a$ = value(1);
    const fn = vi.fn((a: number) => ({ a }));
    const derived$ = value([a$], fn);

    expect(derived$.get()).toBe(derived$.get());
    expect(fn).toHaveBeenCalledOnce();
  });

  it('notifies when result changes', () => {
    const a$ = value(1);
    const parity$ = value([a$], (a) => a % 2);
    const listener = vi.fn();
    parity$.subscribe(listener);

    a$.set(3);
    a$.set(4);

    expect(listener).toHaveBeenCalledExactlyOnceWith(0, 1);
  });

  it('stops notifying after unsubscribe', () => {
    const a$ = value(1);
    const double$ = value([a$], (a) => a * 2);
    const listener = vi.fn();

    double$.subscribe(listener)();
    a$.set(2);

    expect(listener).not.toHaveBeenCalled();
  });

  it('rerenders hook on dependency change', () => {
    const a$ = value(1);
    const double$ = value([a$], (a) => a * 2);
    const { result } = renderHook(() => double$());

    act(() => a$.set(2));

    expect(result.current).toBe(4);
  });
});
