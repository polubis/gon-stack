import { describe, expect, it } from 'vitest';
import { uploadAvatarSchema } from '@schemas/avatar';
import { AVATAR_MAX_BYTES } from '@/shared/avatar/domain/rules';

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const parse = (file: File) =>
  uploadAvatarSchema().shape.in.safeParseAsync({ file });

describe('upload avatar contract', () => {
  it('accepts a PNG', async () => {
    const file = new File([new Uint8Array(PNG)], 'me.png', {
      type: 'image/png',
    });
    expect((await parse(file)).success).toBe(true);
  });

  it('rejects a text file renamed to an image', async () => {
    const file = new File(['hello world, not an image'], 'me.png', {
      type: 'image/png',
    });
    expect((await parse(file)).success).toBe(false);
  });

  it('rejects an SVG', async () => {
    const file = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg"/>'],
      'a.svg',
      { type: 'image/svg+xml' },
    );
    expect((await parse(file)).success).toBe(false);
  });

  it('rejects a file over 10 MB', async () => {
    const file = new File(
      [new Uint8Array(PNG), new Uint8Array(AVATAR_MAX_BYTES)],
      'big.png',
      { type: 'image/png' },
    );
    expect((await parse(file)).success).toBe(false);
  });

  it('rejects a missing file', async () => {
    expect(
      (await uploadAvatarSchema().shape.in.safeParseAsync({})).success,
    ).toBe(false);
  });
});
