import {
  detectImageType,
  IMAGE_SIGNATURE_BYTES,
} from '@/shared/image-processing/detect-image-type';
import { AVATAR_MAX_BYTES } from './rules';

/** Why a file cannot be an avatar, or `null` when it can. Same checks run on the server. */
export const validateAvatarFile = async (
  file: File,
): Promise<string | null> => {
  if (file.size === 0) return 'File is empty';
  if (file.size > AVATAR_MAX_BYTES) return 'File exceeds 10 MB';
  const head = new Uint8Array(
    await file.slice(0, IMAGE_SIGNATURE_BYTES).arrayBuffer(),
  );
  return detectImageType(head)
    ? null
    : 'File must be a JPEG, PNG, WebP or GIF image';
};
