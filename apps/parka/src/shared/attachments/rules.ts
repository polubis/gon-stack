/** Files a task can carry. Mirrored by the `task-attachments` bucket limits. */
export const ATTACHMENT_MAX_COUNT = 5;

/** What a stored file may weigh (videos, documents, archives...). */
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;

/** Largest photo accepted for upload (checked before the size reduction). */
export const ATTACHMENT_MAX_IMAGE_SOURCE_BYTES = 5 * 1024 * 1024;

/** Lossy WebP quality of re-encoded images (see `attachment-image.ts`). */
export const ATTACHMENT_IMAGE_QUALITY = 75;

export const ATTACHMENT_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const ATTACHMENT_ACCEPT = ATTACHMENT_MIME_TYPES.join(',');

export const ATTACHMENT_NAME_MAX_LENGTH = 200;

type Candidate = Pick<File, 'name' | 'size' | 'type'>;

export const isImageMime = (mime: string): boolean => mime.startsWith('image/');

export const isVideoMime = (mime: string): boolean => mime.startsWith('video/');

const megabytes = (bytes: number): number => bytes / 1024 / 1024;

/** Why a file cannot be attached, or `null` when it can. */
export const attachmentRejection = (file: Candidate): string | null => {
  if (!(ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type))
    return 'Ten typ pliku nie jest obsługiwany (obrazy, wideo, PDF, dokumenty, archiwa ZIP, pliki tekstowe)';
  if (file.size === 0) return 'Plik jest pusty';
  if (isImageMime(file.type)) {
    if (file.size > ATTACHMENT_MAX_IMAGE_SOURCE_BYTES)
      return `Zdjęcie jest większe niż ${megabytes(ATTACHMENT_MAX_IMAGE_SOURCE_BYTES)} MB`;
  } else if (file.size > ATTACHMENT_MAX_BYTES)
    return `Plik jest większy niż ${megabytes(ATTACHMENT_MAX_BYTES)} MB`;
  if (file.name.length > ATTACHMENT_NAME_MAX_LENGTH)
    return 'Nazwa pliku jest za długa';
  return null;
};

export const formatFileSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${megabytes(bytes).toFixed(1)} MB`;
