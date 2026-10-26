// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { BadRequest } from '../../core/error-handling';
import { prepareAttachment, type AttachmentImages } from '../attachment-image';

const bytes = (size: number, fill = 7): ArrayBuffer =>
  new Uint8Array(size).fill(fill).buffer;

const fakeImages = (reducedSize: number, readable = true) => {
  const outputs: { format: string; quality: number }[] = [];
  const images: AttachmentImages = {
    info: async () => {
      if (!readable) throw new Error('not an image');
      return { format: 'image/jpeg', width: 4000, height: 3000 };
    },
    input: () => ({
      output: async (options) => {
        outputs.push(options);
        return { response: () => new Response(bytes(reducedSize)) };
      },
    }),
  };
  return { images, outputs };
};

const MB = 1024 * 1024;

describe('prepareAttachment', () => {
  it('re-encodes a photo as lossy WebP at quality 75 without resizing', async () => {
    const { images, outputs } = fakeImages(1 * MB);

    const result = await prepareAttachment(images, {
      bytes: bytes(8 * MB),
      name: 'wakacje.jpg',
      mime: 'image/jpeg',
    });

    expect(outputs).toEqual([{ format: 'image/webp', quality: 75 }]);
    expect(result).toMatchObject({
      name: 'wakacje.webp',
      mime: 'image/webp',
      originalSize: 8 * MB,
    });
    expect(result.bytes.byteLength).toBe(1 * MB);
  });

  it('accepts a photo that is over 5 MB until the reduction makes it fit', async () => {
    const { images } = fakeImages(4 * MB);

    const result = await prepareAttachment(images, {
      bytes: bytes(20 * MB),
      name: 'a.png',
      mime: 'image/png',
    });

    expect(result.bytes.byteLength).toBe(4 * MB);
  });

  it('refuses a photo that is still over 5 MB after the reduction', async () => {
    const { images } = fakeImages(6 * MB);

    await expect(
      prepareAttachment(images, {
        bytes: bytes(20 * MB),
        name: 'a.png',
        mime: 'image/png',
      }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('keeps the original when the re-encoded image would be larger', async () => {
    const { images } = fakeImages(3000);

    const result = await prepareAttachment(images, {
      bytes: bytes(2000),
      name: 'maly.png',
      mime: 'image/png',
    });

    expect(result).toMatchObject({ name: 'maly.png', mime: 'image/png' });
    expect(result.bytes.byteLength).toBe(2000);
  });

  it('keeps an animated GIF as it is', async () => {
    const { images, outputs } = fakeImages(10);
    const frame = [0x21, 0xf9, 0x04, 0, 0, 0, 0, 0];
    const gif = new Uint8Array([...frame, ...frame, ...frame]).buffer;

    const result = await prepareAttachment(images, {
      bytes: gif,
      name: 'ruch.gif',
      mime: 'image/gif',
    });

    expect(outputs).toEqual([]);
    expect(result).toMatchObject({ name: 'ruch.gif', mime: 'image/gif' });
  });

  it('re-encodes a still GIF', async () => {
    const { images, outputs } = fakeImages(10);
    const gif = new Uint8Array([
      0x21,
      0xf9,
      0x04,
      0,
      0,
      0,
      0,
      0,
      ...Array(500).fill(1),
    ]).buffer;

    const result = await prepareAttachment(images, {
      bytes: gif,
      name: 'stop.gif',
      mime: 'image/gif',
    });

    expect(outputs).toHaveLength(1);
    expect(result.mime).toBe('image/webp');
  });

  it('refuses a file that claims to be an image but is not one', async () => {
    const { images } = fakeImages(10, false);

    await expect(
      prepareAttachment(images, {
        bytes: bytes(100),
        name: 'x.png',
        mime: 'image/png',
      }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('leaves a document untouched and holds it to 5 MB', async () => {
    const { images, outputs } = fakeImages(10);

    const small = await prepareAttachment(images, {
      bytes: bytes(1000),
      name: 'a.pdf',
      mime: 'application/pdf',
    });
    await expect(
      prepareAttachment(images, {
        bytes: bytes(5 * MB + 1),
        name: 'b.pdf',
        mime: 'application/pdf',
      }),
    ).rejects.toBeInstanceOf(BadRequest);

    expect(small.bytes.byteLength).toBe(1000);
    expect(outputs).toEqual([]);
  });
});
