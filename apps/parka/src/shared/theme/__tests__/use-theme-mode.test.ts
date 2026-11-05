import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDark } from '../theme';
import { useThemeMode } from '../use-theme-mode';

const setLocalTime = (hour: number) => {
  const now = new Date(2026, 10, 5, hour, 0, 0);
  vi.setSystemTime(now);
};

describe('theme mode', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is light by default', () => {
    const { result } = renderHook(() => useThemeMode());

    expect(result.current[0]).toBe('light');
  });

  it('turns dark on the page when set to dark', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => result.current[1]('dark'));

    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('is back to light when set to light', () => {
    const { result } = renderHook(() => useThemeMode());
    act(() => result.current[1]('dark'));

    act(() => result.current[1]('light'));

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('is remembered for the next visit', () => {
    const first = renderHook(() => useThemeMode());
    act(() => first.result.current[1]('dark'));

    const second = renderHook(() => useThemeMode());

    expect(second.result.current[0]).toBe('dark');
  });

  it('is dark at night when auto', () => {
    vi.useFakeTimers();
    setLocalTime(22);
    const { result } = renderHook(() => useThemeMode());

    act(() => result.current[1]('auto'));

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('is light during the day when auto', () => {
    vi.useFakeTimers();
    setLocalTime(12);
    const { result } = renderHook(() => useThemeMode());

    act(() => result.current[1]('auto'));

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('switches with the hour while auto is on', () => {
    vi.useFakeTimers();
    setLocalTime(18);
    const { result } = renderHook(() => useThemeMode());
    act(() => result.current[1]('auto'));
    expect(document.documentElement.dataset.theme).toBeUndefined();

    act(() => {
      setLocalTime(19);
      vi.advanceTimersByTime(60_000);
    });

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('is remembered as auto for the next visit', () => {
    vi.useFakeTimers();
    setLocalTime(12);
    const first = renderHook(() => useThemeMode());
    act(() => first.result.current[1]('auto'));

    const second = renderHook(() => useThemeMode());

    expect(second.result.current[0]).toBe('auto');
  });

  it('treats 07:00 as day and 06:59 as night', () => {
    expect(resolveDark('auto', 6)).toBe(true);
    expect(resolveDark('auto', 7)).toBe(false);
  });
});
