import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY as FORM_MEMORY_KEY } from '@/shared/form-memory/integration/storage';
import { reconcileDevice } from '../integration/device-cleanup';

const stubPush = (unsubscribe: () => Promise<boolean>) =>
  vi.stubGlobal('navigator', {
    serviceWorker: {
      getRegistration: async () => ({
        pushManager: { getSubscription: async () => ({ unsubscribe }) },
      }),
    },
  });

describe('device reconcile', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('forgets remembered forms and push when another account signs in', async () => {
    const unsubscribe = vi.fn(async () => true);
    stubPush(unsubscribe);
    window.localStorage.setItem('parka:last-user', 'user-ada');
    window.localStorage.setItem(FORM_MEMORY_KEY, '{"x":1}');

    await reconcileDevice('user-bob');

    expect(window.localStorage.getItem(FORM_MEMORY_KEY)).toBeNull();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem('parka:last-user')).toBe('user-bob');
  });

  it('keeps everything when the same account returns', async () => {
    const unsubscribe = vi.fn(async () => true);
    stubPush(unsubscribe);
    window.localStorage.setItem('parka:last-user', 'user-ada');
    window.localStorage.setItem(FORM_MEMORY_KEY, '{"x":1}');

    await reconcileDevice('user-ada');

    expect(window.localStorage.getItem(FORM_MEMORY_KEY)).toBe('{"x":1}');
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('cleans data left by an older session with unknown owner', async () => {
    window.localStorage.setItem(FORM_MEMORY_KEY, '{"x":1}');

    await reconcileDevice('user-ada');

    expect(window.localStorage.getItem(FORM_MEMORY_KEY)).toBeNull();
  });

  it('still cleans forms when push is unavailable', async () => {
    window.localStorage.setItem('parka:last-user', 'user-ada');
    window.localStorage.setItem(FORM_MEMORY_KEY, '{"x":1}');
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration: async () => {
          throw new Error('no worker');
        },
      },
    });

    await expect(reconcileDevice('user-bob')).resolves.toBeUndefined();

    expect(window.localStorage.getItem(FORM_MEMORY_KEY)).toBeNull();
  });
});
