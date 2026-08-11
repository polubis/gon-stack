import { act, renderHook } from '@testing-library/react';
import { useOnInternetReconnect } from '../use-on-internet-reconnect.js';

describe('Internet reconnect listener', () => {
  it('works when the browser regains connectivity, invoking the callback', () => {
    const onReconnect = vi.fn();

    renderHook(() => useOnInternetReconnect(onReconnect));

    expect(onReconnect).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('works when the callback changes between renders, always invoking the latest one', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) => useOnInternetReconnect(callback),
      { initialProps: { callback: first } },
    );

    rerender({ callback: second });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('works when unmounted, removing the listener so later online events are ignored', () => {
    const onReconnect = vi.fn();
    const { unmount } = renderHook(() => useOnInternetReconnect(onReconnect));

    unmount();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(onReconnect).not.toHaveBeenCalled();
  });
});
