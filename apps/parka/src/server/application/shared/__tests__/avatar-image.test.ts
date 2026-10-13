// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { BadRequest } from '../../core/error-handling';
import { buildAvatarVariants, type ImagesBinding } from '../avatar-image';

const fakeImages = (info: ImagesBinding['info']) => {
  const outputs: { width: number; format: string; quality: number }[] = [];
  const images: ImagesBinding = {
    info,
    input: () => ({
      transform: ({ width }) => ({
        output: async ({ format, quality }) => {
          outputs.push({ width, format, quality });
          return { response: () => new Response(`webp-${width}`) };
        },
      }),
    }),
  };
  return { images, outputs };
};

const file = () => new File([new Uint8Array([1, 2, 3])], 'me.png');

describe('avatar variants', () => {
  it('builds 32, 64, 128 and 256 pixel WebP variants at quality 40', async () => {
    const { images, outputs } = fakeImages(async () => ({
      format: 'image/png',
    }));

    const variants = await buildAvatarVariants(images, file());

    expect(variants.map((v) => v.size)).toEqual([32, 64, 128, 256]);
    expect(outputs.map((o) => o.width).sort((a, b) => a - b)).toEqual([
      32, 64, 128, 256,
    ]);
    expect(outputs.every((o) => o.format === 'image/webp')).toBe(true);
    expect(outputs.every((o) => o.quality === 40)).toBe(true);
    expect(new TextDecoder().decode(variants[0]!.bytes)).toBe('webp-32');
  });

  it('rejects a file that cannot be decoded as an image', async () => {
    const { images, outputs } = fakeImages(
      vi.fn().mockRejectedValue(new Error('decode failed')),
    );

    await expect(buildAvatarVariants(images, file())).rejects.toBeInstanceOf(
      BadRequest,
    );
    expect(outputs).toHaveLength(0);
  });
});
