import { useCallback, useEffect, type ComponentProps } from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';

import { context } from '@repo/react-kit/context';
import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

export type CarouselApi = UseEmblaCarouselType[1];

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  orientation: 'horizontal' | 'vertical';
};

/* =============================================================================
 * Context
 * ============================================================================= */

const [CarouselProvider, useCarouselContext] = context(
  'Carousel',
  (value: CarouselContextValue) => value,
);

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type CarouselRootProps = ComponentProps<'div'> & {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

export type CarouselContentProps = ComponentProps<'div'>;
export type CarouselItemProps = ComponentProps<'div'>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const CarouselRoot = ({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: CarouselRootProps) => {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
    plugins,
  );

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: { key: string; preventDefault(): void }) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselProvider
      value={{
        carouselRef,
        api,
        orientation:
          orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselProvider>
  );
};

/* =============================================================================
 * Content
 * ============================================================================= */

export const CarouselContent = ({
  className,
  ...props
}: CarouselContentProps) => {
  const { carouselRef, orientation } = useCarouselContext();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const CarouselItem = ({ className, ...props }: CarouselItemProps) => {
  const { orientation } = useCarouselContext();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Carousel = {
  Root: CarouselRoot,
  Content: CarouselContent,
  Item: CarouselItem,
};
