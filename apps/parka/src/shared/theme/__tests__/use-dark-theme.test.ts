import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useDarkTheme } from '../use-dark-theme';

describe('dark theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('is light by default', () => {
    const { result } = renderHook(() => useDarkTheme());

    expect(result.current[0]).toBe(false);
  });

  it('turns dark on the page when switched on', () => {
    const { result } = renderHook(() => useDarkTheme());

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('is back to light when switched off', () => {
    const { result } = renderHook(() => useDarkTheme());
    act(() => result.current[1](true));

    act(() => result.current[1](false));

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('is remembered for the next visit', () => {
    const first = renderHook(() => useDarkTheme());
    act(() => first.result.current[1](true));

    const second = renderHook(() => useDarkTheme());

    expect(second.result.current[0]).toBe(true);
  });
});
