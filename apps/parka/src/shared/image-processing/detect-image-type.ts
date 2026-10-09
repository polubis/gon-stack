type ImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

const startsWith = (bytes: Uint8Array, signature: readonly number[], at = 0) =>
  signature.every((byte, index) => bytes[at + index] === byte);

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

export const IMAGE_SIGNATURE_BYTES = 12;

/** Type from the file's own first bytes, never from what the client declared. */
export const detectImageType = (bytes: Uint8Array): ImageType | null => {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  if (
    startsWith(bytes, ascii('GIF87a')) ||
    startsWith(bytes, ascii('GIF89a'))
  ) {
    return 'image/gif';
  }
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) {
    return 'image/webp';
  }

  return null;
};
