import { isImageMime, isVideoMime } from './rules';

/** Mirrored by the `knowledge-media` bucket (bucket limit is the video one). */
export const KNOWLEDGE_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;
export const KNOWLEDGE_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const;

export const KNOWLEDGE_MEDIA_ACCEPT = [
  ...KNOWLEDGE_IMAGE_MIME_TYPES,
  ...KNOWLEDGE_VIDEO_MIME_TYPES,
].join(',');

export const KNOWLEDGE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const KNOWLEDGE_VIDEO_MAX_BYTES = 20 * 1024 * 1024;

type Candidate = Pick<File, 'size' | 'type'>;

/** Kind of a supported file type, `null` for anything else. */
export const knowledgeMediaKind = (mime: string): 'image' | 'video' | null =>
  (KNOWLEDGE_IMAGE_MIME_TYPES as readonly string[]).includes(mime)
    ? 'image'
    : (KNOWLEDGE_VIDEO_MIME_TYPES as readonly string[]).includes(mime)
      ? 'video'
      : null;

/** Why a file cannot be a reel media, or `null` when it can. */
export const knowledgeMediaRejection = (file: Candidate): string | null => {
  if (!knowledgeMediaKind(file.type))
    return 'Allowed: PNG, JPEG, WebP, GIF images and MP4, WebM video';
  if (file.size === 0) return 'File is empty';
  if (isVideoMime(file.type) && file.size > KNOWLEDGE_VIDEO_MAX_BYTES)
    return 'Video is larger than 20 MB';
  if (isImageMime(file.type) && file.size > KNOWLEDGE_IMAGE_MAX_BYTES)
    return 'Image is larger than 5 MB';
  return null;
};
