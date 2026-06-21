import { appConfig } from '@/core/config';
import { Testimonial, type TestimonialProps } from './testimonial';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import { useCallback, useEffect, useRef, useState } from 'react';

const TestimonialsSection = ({
  testimonials,
}: {
  testimonials: TestimonialProps[];
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

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
      { threshold: 0.1, rootMargin: '0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [carouselApi]);

  const setApi = useCallback((api: CarouselApi | undefined) => {
    setCarouselApi(api ?? null);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="page-section flex justify-center flex-col"
      aria-labelledby="testimonials-title"
      id={appConfig.opinionsSection.id}
    >
      <h2
        id="testimonials-title"
        className="text-h2 text-center fluid max-w-3xl mb-16 font-500"
      >
        Opinie osób, które osiągnęły swój cel z moją pomocą
      </h2>
      <Carousel
        aria-label="Opinie uczestników konsultacji"
        opts={{
          loop: true,
        }}
        setApi={setApi}
        plugins={[
          AutoScroll({
            speed: 0.5,
          }),
        ]}
      >
        <div
          className="absolute size-[50%] aspect-square inset-0 m-auto bg-[rgba(21,214,130,0.24)] blur-3xl"
          aria-hidden="true"
        />
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem
              className="mbl:basis-1/2 ltp:basis-1/3"
              key={testimonial.name}
            >
              <Testimonial
                className="px-4 mbl:px-6 tbt:px-10"
                {...testimonial}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div
          className="absolute top-0 right-0 h-full w-4 mbl:w-20 tbt:w-40 bg-gradient-to-r from-transparent to-background"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 h-full w-4 mbl:w-20 tbt:w-40 bg-gradient-to-r from-background to-transparent"
          aria-hidden="true"
        />
      </Carousel>
    </section>
  );
};

export { TestimonialsSection };
