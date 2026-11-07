import { describe, expect, it } from 'vitest';
import { attachmentRejection, formatFileSize } from '../rules';

const file = (over: Partial<Pick<File, 'name' | 'size' | 'type'>> = {}) => ({
  name: 'a.pdf',
  size: 1000,
  type: 'application/pdf',
  ...over,
});

describe('attachment rules', () => {
  it('accepts a small pdf, image and text file', () => {
    expect(attachmentRejection(file())).toBeNull();
    expect(attachmentRejection(file({ type: 'image/png' }))).toBeNull();
    expect(attachmentRejection(file({ type: 'text/plain' }))).toBeNull();
  });

  it('accepts mp4 video and other document formats', () => {
    expect(
      attachmentRejection(file({ name: 'a.mp4', type: 'video/mp4' })),
    ).toBeNull();
    expect(
      attachmentRejection(file({ name: 'a.zip', type: 'application/zip' })),
    ).toBeNull();
  });

  it('rejects unknown types', () => {
    expect(
      attachmentRejection(file({ type: 'application/x-msdownload' })),
    ).not.toBeNull();
  });

  it('rejects empty files and files over 20 MB, accepts exactly 20 MB', () => {
    expect(attachmentRejection(file({ size: 0 }))).not.toBeNull();
    expect(attachmentRejection(file({ size: 20 * 1024 * 1024 + 1 }))).toBe(
      'Plik jest większy niż 20 MB',
    );
    expect(attachmentRejection(file({ size: 20 * 1024 * 1024 }))).toBeNull();
  });

  it('keeps photos at 5 MB', () => {
    expect(
      attachmentRejection(
        file({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }),
      ),
    ).toBe('Zdjęcie jest większe niż 5 MB');
  });

  it('rejects names over 200 characters', () => {
    expect(attachmentRejection(file({ name: 'x'.repeat(201) }))).not.toBeNull();
  });

  it('formats sizes in KB and MB', () => {
    expect(formatFileSize(10)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
