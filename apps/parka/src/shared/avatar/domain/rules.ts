/** Square sizes, in pixels, the server stores for every uploaded avatar. */
export const AVATAR_SIZES = [32, 64, 128, 256] as const;

export type AvatarSize = (typeof AVATAR_SIZES)[number];

export const AVATAR_MAX_BYTES = 10 * 1024 * 1024;

/** WebP quality of every variant: 60% lower than the full 100. */
export const AVATAR_WEBP_QUALITY = 40;
