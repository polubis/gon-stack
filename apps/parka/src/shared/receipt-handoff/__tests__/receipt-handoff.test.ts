import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stashReceipt, takeReceipt } from '../receipt-handoff';

describe('receipt handoff', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('hands the picked photo to the next page', async () => {
    const photo = new File(['abc'], 'receipt.png', { type: 'image/png' });

    expect(await stashReceipt(photo)).toBe(true);
    const taken = await takeReceipt();

    expect(taken?.name).toBe('receipt.png');
    expect(taken?.type).toBe('image/png');
    expect(await taken?.text()).toBe('abc');
  });

  it('gives the photo only once', async () => {
    await stashReceipt(new File(['abc'], 'receipt.png', { type: 'image/png' }));

    await takeReceipt();

    expect(await takeReceipt()).toBeNull();
  });

  it('has nothing to take when no photo was stashed', async () => {
    expect(await takeReceipt()).toBeNull();
  });

  it('reports a photo that does not fit in storage', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    expect(
      await stashReceipt(new File(['abc'], 'big.png', { type: 'image/png' })),
    ).toBe(false);
  });

  it('ignores a corrupted stash', async () => {
    sessionStorage.setItem('parka:receipt-handoff', '{not json');

    expect(await takeReceipt()).toBeNull();
  });
});
