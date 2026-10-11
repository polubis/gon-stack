import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRememberedField } from '../presentation/use-remembered-field';

const STORAGE_KEY = 'parka:form-memory';

describe('remembered form field', () => {
  beforeEach(() => window.localStorage.clear());

  it('recalls nothing for a field never remembered', () => {
    const { result } = renderHook(() => useRememberedField({ key: 'a' }));

    expect(result.current.recalled).toBeNull();
  });

  it('recalls a value remembered earlier', () => {
    const first = renderHook(() => useRememberedField({ key: 'a' }));
    act(() => first.result.current.remember('Karta'));

    const second = renderHook(() => useRememberedField({ key: 'a' }));

    expect(second.result.current.recalled).toBe('Karta');
  });

  it('keeps fields apart', () => {
    const a = renderHook(() => useRememberedField({ key: 'a' }));
    act(() => a.result.current.remember('Karta'));

    const b = renderHook(() => useRememberedField({ key: 'b' }));

    expect(b.result.current.recalled).toBeNull();
  });

  it('forgets a field remembered as empty', () => {
    const first = renderHook(() => useRememberedField({ key: 'a' }));
    act(() => first.result.current.remember('Karta'));
    act(() => first.result.current.remember(''));

    const second = renderHook(() => useRememberedField({ key: 'a' }));

    expect(second.result.current.recalled).toBeNull();
  });

  it('does not recall a value the field no longer accepts', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 'gone' }));

    const { result } = renderHook(() =>
      useRememberedField({ key: 'a', accept: (v) => v !== 'gone' }),
    );

    expect(result.current.recalled).toBeNull();
  });

  it('stores and recalls the value trimmed', () => {
    const first = renderHook(() => useRememberedField({ key: 'a' }));
    act(() => first.result.current.remember('  Biedronka '));

    const second = renderHook(() => useRememberedField({ key: 'a' }));

    expect(second.result.current.recalled).toBe('Biedronka');
  });

  it('forgets a field remembered as only whitespace', () => {
    const first = renderHook(() => useRememberedField({ key: 'a' }));
    act(() => first.result.current.remember('Karta'));
    act(() => first.result.current.remember('   '));

    const second = renderHook(() => useRememberedField({ key: 'a' }));

    expect(second.result.current.recalled).toBeNull();
  });

  it('recalls a value stored with stray spaces trimmed', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: ' Karta  ' }));

    const { result } = renderHook(() => useRememberedField({ key: 'a' }));

    expect(result.current.recalled).toBe('Karta');
  });

  it('does not recall a stored whitespace-only value', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: '   ' }));

    const { result } = renderHook(() => useRememberedField({ key: 'a' }));

    expect(result.current.recalled).toBeNull();
  });

  it('resolves a remembered value to the allowed one ignoring case and spaces', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: ' C-1 ' }));

    const { result } = renderHook(() =>
      useRememberedField({ key: 'a', options: ['c-2', 'c-1'] }),
    );

    expect(result.current.recalled).toBe('c-1');
  });

  it('does not recall a value missing from the allowed ones', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 'c-9' }));

    const { result } = renderHook(() =>
      useRememberedField({ key: 'a', options: ['c-1'] }),
    );

    expect(result.current.recalled).toBeNull();
  });

  it('passes the resolved value to accept', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: ' C-1' }));

    const { result } = renderHook(() =>
      useRememberedField({
        key: 'a',
        options: ['c-1'],
        accept: (v) => v === 'c-1',
      }),
    );

    expect(result.current.recalled).toBe('c-1');
  });

  it('does not recall when disabled', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 'Karta' }));

    const { result } = renderHook(() =>
      useRememberedField({ key: 'a', enabled: false }),
    );

    expect(result.current.recalled).toBeNull();
  });

  it.each([
    ['broken json', '{not json'],
    ['an array', '["Karta"]'],
    ['a number', '5'],
    ['a non-text value', '{"a":5}'],
  ])('tolerates stored data that is %s', (_, raw) => {
    window.localStorage.setItem(STORAGE_KEY, raw);

    const { result } = renderHook(() => useRememberedField({ key: 'a' }));
    act(() => result.current.remember('Gotówka'));

    expect(result.current.recalled).toBeNull();
    expect(
      renderHook(() => useRememberedField({ key: 'a' })).result.current
        .recalled,
    ).toBe('Gotówka');
  });
});
