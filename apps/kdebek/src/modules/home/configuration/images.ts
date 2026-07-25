export const homeImagesConfig = {
  quality: 75,
  format: 'webp' as const,
  hero: {
    width: 1280,
    widths: [640, 960, 1280] as const,
    sizes: '(max-width: 1024px) 100vw, 640px',
  },
  gallery: {
    width: 1280,
    widths: [640, 960, 1280] as const,
    sizes: '(max-width: 1024px) 100vw, 637px',
  },
  therapy: {
    width: 960,
    widths: [480, 720, 960] as const,
    sizes: '(max-width: 1024px) 100vw, 400px',
  },
} as const;
