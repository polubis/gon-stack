import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_BYTES } from '../domain/rules';
import { validateAvatarFile } from '../domain/validate-avatar-file';

const PNG_HEAD = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const file = (bytes: number[], name: string) =>
  new File([new Uint8Array(bytes)], name, { type: 'image/png' });

const padded = (size: number) =>
  new File(
    [new Uint8Array(PNG_HEAD), new Uint8Array(size - PNG_HEAD.length)],
    'pad.png',
    { type: 'image/png' },
  );

describe('avatar file validation', () => {
  it('accepts a real image', async () => {
    expect(await validateAvatarFile(file(PNG_HEAD, 'me.png'))).toBeNull();
  });

  it('rejects a file that only claims to be an image', async () => {
    expect(
      await validateAvatarFile(file([1, 2, 3, 4, 5, 6, 7, 8], 'fake.png')),
    ).toBe('File must be a JPEG, PNG, WebP or GIF image');
  });

  it('rejects an empty file', async () => {
    expect(await validateAvatarFile(file([], 'empty.png'))).toBe(
      'File is empty',
    );
  });

  it('rejects a file over 10 MB', async () => {
    expect(await validateAvatarFile(padded(AVATAR_MAX_BYTES + 1))).toBe(
      'File exceeds 10 MB',
    );
  });

  it('accepts a file of exactly 10 MB', async () => {
    expect(await validateAvatarFile(padded(AVATAR_MAX_BYTES))).toBeNull();
  });
});
