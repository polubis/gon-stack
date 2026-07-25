import type { ImgHTMLAttributes } from 'react';

import type { ResolvedImage } from '../domain/models';

type OptimizedImageProps = {
  image: ResolvedImage;
  alt: string;
} & Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  'className' | 'loading' | 'decoding' | 'fetchPriority' | 'aria-hidden'
>;

export const OptimizedImage = ({
  image,
  alt,
  className,
  loading,
  decoding,
  fetchPriority,
  'aria-hidden': ariaHidden,
}: OptimizedImageProps) => (
  <img
    src={image.src}
    srcSet={image.srcSet}
    sizes={image.sizes}
    width={image.width}
    height={image.height}
    alt={alt}
    className={className}
    loading={loading}
    decoding={decoding}
    fetchPriority={fetchPriority}
    aria-hidden={ariaHidden}
  />
);
