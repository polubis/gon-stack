import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { ResolvedImage } from '../domain/models';

import { copy } from './copy';
import { OptimizedImage } from './optimized-image';

const AUTOPLAY_MS = 5000;

type AboutGalleryProps = {
  images: ResolvedImage[];
};

export const AboutGallery = ({ images }: AboutGalleryProps) => {
  const slides = images.map((image, index) => ({
    image,
    alt: copy.aboutGallery.slides[index] ?? '',
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isPaused = isHovered || isManuallyPaused;

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused]);

  return (
    <div
      className="relative w-full"
      role="region"
      aria-label={copy.aboutGallery.ariaLabel}
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-3xl ring-1 ring-line">
        <div
          className="flex items-start transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map(({ image, alt }, index) => (
            <figure key={image.src} className="w-full shrink-0">
              <OptimizedImage
                image={image}
                alt={alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="block h-auto w-full max-w-full"
                aria-hidden={index !== activeIndex}
              />
            </figure>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label={
          isManuallyPaused
            ? copy.aboutGallery.ariaPlay
            : copy.aboutGallery.ariaPause
        }
        aria-pressed={isManuallyPaused}
        onClick={() => setIsManuallyPaused((paused) => !paused)}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-secondary shadow-[0_4px_14px_rgba(15,23,42,0.35)] ring-1 ring-line outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {isManuallyPaused ? (
          <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only">
        {copy.aboutGallery.srOnlyPrefix} {activeIndex + 1}{' '}
        {copy.aboutGallery.srOnlySeparator} {slides.length}
      </span>
    </div>
  );
};
