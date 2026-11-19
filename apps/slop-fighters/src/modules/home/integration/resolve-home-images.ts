import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

import heroSrc from '@/assets/images/hero.webp';
import slide03 from '@/assets/images/03.webp';
import slide04 from '@/assets/images/04.webp';
import slide05 from '@/assets/images/05.webp';
import slide06 from '@/assets/images/06.webp';
import therapySrc from '@/assets/images/testimonials-therapy.webp';
import { homeImagesConfig } from '../configuration/images';
import type { HomeImages, ResolvedImage } from '../domain/models';

const gallerySources = [slide03, slide04, slide05, slide06] as const;

type ImageResult = Awaited<ReturnType<typeof getImage>>;
type ImageVariantConfig =
  | typeof homeImagesConfig.hero
  | typeof homeImagesConfig.gallery
  | typeof homeImagesConfig.therapy;

const toResolvedImage = (result: ImageResult): ResolvedImage => ({
  src: result.src,
  srcSet: result.srcSet?.attribute,
  sizes:
    typeof result.attributes.sizes === 'string'
      ? result.attributes.sizes
      : undefined,
  width: Number(result.attributes.width),
  height: Number(result.attributes.height),
});

const resolveImage = (src: ImageMetadata, config: ImageVariantConfig) =>
  getImage({
    src,
    width: config.width,
    widths: [...config.widths],
    sizes: config.sizes,
    format: homeImagesConfig.format,
    quality: homeImagesConfig.quality,
  });

export const resolveHomeImages = async (): Promise<HomeImages> => {
  const [hero, gallery, therapy] = await Promise.all([
    resolveImage(heroSrc, homeImagesConfig.hero),
    Promise.all(
      gallerySources.map((src) => resolveImage(src, homeImagesConfig.gallery)),
    ),
    resolveImage(therapySrc, homeImagesConfig.therapy),
  ]);

  return {
    hero: toResolvedImage(hero),
    gallery: gallery.map(toResolvedImage),
    therapy: toResolvedImage(therapy),
  };
};
