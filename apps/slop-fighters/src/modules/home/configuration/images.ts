export const homeImagesConfig = {
  quality: 75,
  format: 'webp' as const,
  hero: {
    width: 1280,
    widths: [640, 960, 1280] as const,
    sizes: '(max-width: 1023px) calc(100vw - 3rem), 596px',
  },
  gallery: {
    width: 1280,
    widths: [640, 960, 1280] as const,
    sizes: '(max-width: 1023px) calc(100vw - 3rem), 584px',
  },
  therapy: {
    width: 960,
    widths: [480, 720, 960] as const,
    sizes: '(max-width: 1023px) calc(100vw - 3rem), 400px',
  },
} as const;
