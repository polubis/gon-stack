import { ArticleTile, type ArticleTileProps } from './article-tile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import AutoScroll from 'embla-carousel-auto-scroll';

const publicationsMock: ArticleTileProps[] = [
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74-492584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435b-ab584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435b-ab2584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-4358-492584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435ba8-492584bdec6b',
  },
  {
    cdate: '2025-04-01T12:52:32.109Z',
    name: 'Full Tutorial on Updating Dependencies in JS Projects',
    url: 'https://4markdown.com/full-tutorial-on-updating-dependencies-in-js-projects/',
    id: '81054519-74d2-435b-aba8-492584b',
  },
];

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
      <Carousel
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
        <CarouselContent>
          {publicationsMock.map((publication) => (
            <CarouselItem
              className="sbl:basis-1/2 tbt:basis-1/3 ltp:basis-1/4 dsp:basis-1/5"
              key={publication.name}
            >
              <div className="px-4 sbl:px-0 py-1">
                <ArticleTile {...publication} />
              </div>
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

export { ArticlesSection };
