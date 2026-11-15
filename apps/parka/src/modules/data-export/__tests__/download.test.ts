import { afterEach, describe, expect, it, vi } from 'vitest';
import { download } from '../presentation/download';

afterEach(() => vi.restoreAllMocks());

describe('download', () => {
  it('saves the file under its name and releases the blob url', async () => {
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((b: Blob | MediaSource) => {
      blob = b as Blob;
      return 'blob:file';
    });
    URL.revokeObjectURL = vi.fn();
    let saved: string | undefined;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved = this.download;
    });

    download({ name: 'a.csv', type: 'text/csv', content: 'x;y' });

    expect(saved).toBe('a.csv');
    expect(await blob?.text()).toBe('x;y');
    expect(blob?.type).toBe('text/csv');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:file');
    expect(document.querySelector('a[download]')).toBeNull();
  });
});
