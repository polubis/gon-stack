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

  it('rejects other types', () => {
    expect(
      attachmentRejection(file({ type: 'application/zip' })),
    ).not.toBeNull();
  });

  it('rejects empty files and files over 5 MB, accepts exactly 5 MB', () => {
    expect(attachmentRejection(file({ size: 0 }))).not.toBeNull();
    expect(
      attachmentRejection(file({ size: 5 * 1024 * 1024 + 1 })),
    ).not.toBeNull();
    expect(attachmentRejection(file({ size: 5 * 1024 * 1024 }))).toBeNull();
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
