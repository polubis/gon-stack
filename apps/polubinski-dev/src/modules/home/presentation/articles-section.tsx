import { ArticleTile } from './article-tile';
import { Carousel } from '@/libs/ui/carousel';
import { useAutoScrollOnVisible } from './use-auto-scroll-on-visible';
import { useContext } from './context';
import { appConfig } from '../configuration/constraints';
import { cn } from '@repo/react-kit/cn';
import AutoScroll from 'embla-carousel-auto-scroll';

type ArticlesSectionProps = {
  className?: string;
};

const ArticlesSection = ({ className }: ArticlesSectionProps) => {
  const { articles } = useContext();
  const { sectionRef, setApi } = useAutoScrollOnVisible();

  if (articles.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={cn('flex flex-col justify-center', className)}
      aria-labelledby="activity-title"
    >
      <header className="fluid flex items-center justify-between w-full mb-6">
        <h2 id="activity-title" className="text-h5 font-500">
          Twórczość
        </h2>
        <a
          href={appConfig.articlesSection.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-regular font-400 text-foreground-secondary underline underline-offset-4"
        >
          Zobacz wszystko
        </a>
      </header>
      <Carousel.Root
        aria-label="Lista opublikowanych artykułów"
        opts={{
          loop: true,
        }}
        setApi={setApi}
        plugins={[AutoScroll({ speed: 0.5 })]}
      >
        <div
          className="absolute size-[50%] aspect-square inset-0 m-auto bg-[rgba(21,214,130,0.24)] blur-3xl"
          aria-hidden="true"
        />
        <Carousel.Content>
          {articles.map((publication) => (
            <Carousel.Item
              className="sbl:basis-1/2 tbt:basis-1/3 ltp:basis-1/4 dsp:basis-1/5"
              key={publication.id}
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
