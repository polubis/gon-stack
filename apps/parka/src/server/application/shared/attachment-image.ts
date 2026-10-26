import {
  ATTACHMENT_IMAGE_QUALITY,
  ATTACHMENT_MAX_BYTES,
  isImageMime,
} from '@/shared/attachments/rules';
import { BadRequest } from '../core/error-handling';

/** The part of the Cloudflare Images binding used here. */
export type AttachmentImages = {
  info: (stream: ReadableStream<Uint8Array>) => Promise<{
    format: string;
    width: number;
    height: number;
  }>;
  input: (stream: ReadableStream<Uint8Array>) => {
    output: (options: {
      format: 'image/webp';
      quality: number;
    }) => Promise<{ response: () => Response }>;
  };
};

export type PreparedAttachment = {
  bytes: ArrayBuffer;
  name: string;
  mime: string;
  /** Size of what the user sent, for "reduced from ... to ...". */
  originalSize: number;
};

const stream = (bytes: ArrayBuffer): ReadableStream<Uint8Array> =>
  new Blob([bytes]).stream();

/** More than one graphic control block means animation frames. */
const isAnimatedGif = (bytes: ArrayBuffer): boolean => {
  const data = new Uint8Array(bytes);
  let frames = 0;
  for (let i = 0; i + 3 < data.length; i++) {
    if (data[i] === 0x21 && data[i + 1] === 0xf9 && data[i + 2] === 0x04) {
      frames += 1;
      if (frames > 1) return true;
    }
  }
  return false;
};

const asWebpName = (name: string): string =>
  `${name.replace(/\.[^./\\]+$/, '')}.webp`;

/**
 * Photos are re-encoded as lossy WebP at quality 75 with their pixel
 * dimensions untouched: 75 is the usual point where the loss is hard to see
 * while camera JPEGs/PNG screenshots shrink by roughly 60-90%. An animated GIF
 * is kept as it is (re-encoding would drop the frames) and so is any image whose
 * re-encoded form would not be smaller. The size limit applies afterwards.
 */
export const prepareAttachment = async (
  images: AttachmentImages,
  file: { bytes: ArrayBuffer; name: string; mime: string },
): Promise<PreparedAttachment> => {
  const originalSize = file.bytes.byteLength;
  let result: PreparedAttachment = { ...file, originalSize };

  if (isImageMime(file.mime)) {
    // Decoding proves it is a real image, whatever its name or type says.
    await images.info(stream(file.bytes)).catch((error: unknown) => {
      throw new BadRequest(error, 'File is not a readable image');
    });

    if (!(file.mime === 'image/gif' && isAnimatedGif(file.bytes))) {
      const output = await images
        .input(stream(file.bytes))
        .output({ format: 'image/webp', quality: ATTACHMENT_IMAGE_QUALITY });
      const reduced = await output.response().arrayBuffer();
      if (reduced.byteLength < originalSize)
        result = {
          bytes: reduced,
          name: asWebpName(file.name),
          mime: 'image/webp',
          originalSize,
        };
    }
  }

  if (result.bytes.byteLength > ATTACHMENT_MAX_BYTES)
    throw new BadRequest(
      undefined,
      `File is larger than ${ATTACHMENT_MAX_BYTES / 1024 / 1024} MB${isImageMime(file.mime) ? ' even after the size reduction' : ''}`,
    );
  return result;
};
