// @astrojs/cloudflare replaces Astro's image service with a build-time no-op
// whenever it sees the entrypoint pointing at the literal string
// 'astro/assets/services/sharp' (see hasUserImageService in
// @astrojs/cloudflare/dist/utils/image-config.js). Re-exporting the same
// service under a different module specifier avoids that string check, so
// `imageService: 'compile'` actually resizes images with sharp at build time
// instead of passing the original files through unchanged.
export { default } from 'astro/assets/services/sharp';
