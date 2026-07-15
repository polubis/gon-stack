import AutoScroll from 'embla-carousel-auto-scroll';
import { appConfig } from '../configuration/constraints';
import { Testimonial } from './testimonial';
import { useContext } from './context';
import { Carousel } from '@/libs/ui/carousel';
import { useAutoScrollOnVisible } from './use-auto-scroll-on-visible';

const TestimonialsSection = () => {
  const { testimonials } = useContext();
  const { sectionRef, setApi } = useAutoScrollOnVisible();

  if (testimonials.length === 0) return null;

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
      <Carousel.Root
        aria-label="Opinie uczestników konsultacji"
        opts={{ loop: true }}
        setApi={setApi}
        plugins={[AutoScroll({ speed: 0.5 })]}
      >
        <div
          className="absolute size-[50%] aspect-square inset-0 m-auto bg-[rgba(21,214,130,0.24)] blur-3xl"
          aria-hidden="true"
        />
        <Carousel.Content>
          {testimonials.map((testimonial) => (
            <Carousel.Item
              className="mbl:basis-1/2 ltp:basis-1/3"
              key={testimonial.name}
            >
              <Testimonial
                className="px-4 mbl:px-6 tbt:px-10"
                {...testimonial}
              />
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <div
          className="absolute top-0 right-0 h-full w-4 mbl:w-20 tbt:w-40 bg-gradient-to-r from-transparent to-background"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 h-full w-4 mbl:w-20 tbt:w-40 bg-gradient-to-r from-background to-transparent"
          aria-hidden="true"
        />
      </Carousel.Root>
    </section>
  );
};

export { TestimonialsSection };
