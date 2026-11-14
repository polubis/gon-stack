import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from '../presentation/download';

describe('reports download', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves the content under the given name and frees the link', async () => {
    const createUrl = vi.fn((_blob: Blob) => 'blob:report');
    const revokeUrl = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: createUrl,
      revokeObjectURL: revokeUrl,
    });
    let saved: { name: string; href: string } | null = null;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved = { name: this.download, href: this.href };
    });

    downloadBlob('report.csv', 'text/csv', 'a;b');

    const blob = createUrl.mock.calls[0]?.[0] as Blob;
    expect(saved).toEqual({ name: 'report.csv', href: 'blob:report' });
    expect(blob.type).toBe('text/csv');
    expect(await blob.text()).toBe('a;b');
    expect(revokeUrl).toHaveBeenCalledWith('blob:report');
    expect(document.querySelector('a[download]')).toBeNull();
    vi.unstubAllGlobals();
  });
});
