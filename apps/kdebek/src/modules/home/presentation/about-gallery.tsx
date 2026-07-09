import { useCallback, useEffect, useState } from 'react';

import { images } from './images';

const slides = images.about.gallery;
const AUTOPLAY_MS = 5000;

export const AboutGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused]);

  return (
    <div
      className="relative w-full"
      role="region"
      aria-label="Galeria zdjęć"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden rounded-3xl ring-1 ring-line">
        <div
          className="flex items-start transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map(({ src, alt }, index) => (
            <figure key={src} className="w-full shrink-0">
              <img
                src={src}
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
      <span className="sr-only">
        Slajd {activeIndex + 1} z {slides.length}
      </span>
    </div>
  );
};
