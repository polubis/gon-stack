import { describe, expect, it } from 'vitest';
import { detectImageType } from '../detect-image-type';

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));
const bytes = (...values: number[]) => new Uint8Array(values);

describe('detectImageType', () => {
  it('recognises a jpeg', () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0))).toBe(
      'image/jpeg',
    );
  });

  it('recognises a png', () => {
    expect(
      detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0)),
    ).toBe('image/png');
  });

  it('recognises both gif versions', () => {
    expect(detectImageType(bytes(...ascii('GIF87a'), 1))).toBe('image/gif');
    expect(detectImageType(bytes(...ascii('GIF89a'), 1))).toBe('image/gif');
  });

  it('recognises a webp', () => {
    expect(
      detectImageType(bytes(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP'), 0)),
    ).toBe('image/webp');
  });

  it('rejects a RIFF file that is not webp', () => {
    expect(
      detectImageType(bytes(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WAVE'))),
    ).toBeNull();
  });

  it('rejects unknown, truncated and empty content', () => {
    expect(detectImageType(bytes(...ascii('%PDF-1.7')))).toBeNull();
    expect(detectImageType(bytes(0xff, 0xd8))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});
