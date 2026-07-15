import { useCallback, useEffect, useRef, useState } from 'react';
import type { CarouselApi } from '@/libs/ui/carousel';

type UseAutoScrollOnVisibleOptions = {
  threshold?: number;
  rootMargin?: string;
};

const useAutoScrollOnVisible = <TSection extends HTMLElement = HTMLElement>(
  options?: UseAutoScrollOnVisibleOptions,
) => {
  const sectionRef = useRef<TSection>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const setApi = useCallback((api: CarouselApi) => {
    setCarouselApi(api ?? null);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !carouselApi) return;

    const autoScroll = carouselApi.plugins()?.autoScroll;
    if (!autoScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          autoScroll.play();
        } else {
          autoScroll.stop();
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px',
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [carouselApi, options?.threshold, options?.rootMargin]);

  return { sectionRef, setApi };
};

export { useAutoScrollOnVisible };
