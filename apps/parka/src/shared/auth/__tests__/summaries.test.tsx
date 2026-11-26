import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  setProfileSummary,
  useProfileSummary,
} from '../presentation/profile-summary';
import {
  setUnreadSummary,
  useUnreadSummary,
} from '../presentation/unread-summary';

describe('account summaries', () => {
  it('shows the unread total the notifications publish', () => {
    const { result } = renderHook(() => useUnreadSummary());

    act(() => setUnreadSummary(3));

    expect(result.current).toBe(3);
  });

  it('merges profile changes without losing the other field', () => {
    const { result } = renderHook(() => useProfileSummary());

    act(() => setProfileSummary({ name: 'Ada' }));
    act(() => setProfileSummary({ avatarUrl: '/ada.png' }));

    expect(result.current).toEqual({ name: 'Ada', avatarUrl: '/ada.png' });
  });

  it('does not re-render when the profile stays the same', () => {
    let renders = 0;
    renderHook(() => {
      renders += 1;
      return useProfileSummary();
    });
    act(() => setProfileSummary({ name: 'Grace' }));
    const before = renders;

    act(() => setProfileSummary({ name: 'Grace' }));

    expect(renders).toBe(before);
  });
});
