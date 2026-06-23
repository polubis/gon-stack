import { ArticleTile } from './article-tile';
import { publicationsMock } from '../integration/repository';
import { Carousel } from '@/libs/ui/carousel';
import AutoScroll from 'embla-carousel-auto-scroll';

const currentYear = new Date().getFullYear();

const ArticlesSection = () => {
  return (
    <section
      className="flex flex-col justify-center mt-20"
      aria-labelledby="activity-title"
    >
      <header className="fluid flex items-center justify-between w-full mb-6">
        <h2 id="activity-title" className="text-h5 font-500">
          Twórczość
        </h2>
        <span
          className="text-h5 font-500 text-foreground-secondary"
          aria-hidden="true"
        >
          /{currentYear}
        </span>
      </header>
      <Carousel.Root
        aria-label="Opinie uczestników konsultacji"
        opts={{
          loop: true,
        }}
        plugins={[
          AutoScroll({
            playOnInit: true,
            speed: 0.5,
          }),
        ]}
      >
        <div
          className="absolute size-[50%] aspect-square inset-0 m-auto bg-[rgba(21,214,130,0.24)] blur-3xl"
          aria-hidden="true"
        />
        <Carousel.Content>
          {publicationsMock.map((publication) => (
            <Carousel.Item
              className="sbl:basis-1/2 tbt:basis-1/3 ltp:basis-1/4 dsp:basis-1/5"
              key={publication.name}
            >
              <div className="px-4 sbl:px-0 py-1">
                <ArticleTile {...publication} />
              </div>
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

export { ArticlesSection };
