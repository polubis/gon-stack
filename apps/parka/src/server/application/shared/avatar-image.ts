import {
  AVATAR_SIZES,
  AVATAR_WEBP_QUALITY,
  type AvatarSize,
} from '@/shared/avatar/domain/rules';
import { BadRequest } from '../core/error-handling';

/** The part of the Cloudflare Images binding used here. */
export type ImagesBinding = {
  info: (stream: ReadableStream<Uint8Array>) => Promise<{ format: string }>;
  input: (stream: ReadableStream<Uint8Array>) => {
    transform: (options: { width: number; height: number; fit: 'cover' }) => {
      output: (options: {
        format: 'image/webp';
        quality: number;
      }) => Promise<{ response: () => Response }>;
    };
  };
};

export type AvatarVariant = { size: AvatarSize; bytes: ArrayBuffer };

/**
 * Square WebP variants scaled from the original. Decoding the file proves it
 * is a real image, whatever its name or declared type says.
 */
export const buildAvatarVariants = async (
  images: ImagesBinding,
  file: File,
): Promise<AvatarVariant[]> => {
  await images.info(file.stream()).catch((error: unknown) => {
    throw new BadRequest(error, 'File is not a readable image');
  });

  return Promise.all(
    AVATAR_SIZES.map(async (size) => {
      const output = await images
        .input(file.stream())
        .transform({ width: size, height: size, fit: 'cover' })
        .output({ format: 'image/webp', quality: AVATAR_WEBP_QUALITY });
      return { size, bytes: await output.response().arrayBuffer() };
    }),
  );
};
