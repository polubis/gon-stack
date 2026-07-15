import { Main } from '@/modules/home/presentation/main';
import type {
  Article,
  ScoreStats,
  Testimonial,
} from '@/modules/home/domain/models';

type ModuleProps = {
  testimonials: Testimonial[];
  articles: Article[];
  scoreStats: ScoreStats | null;
};

export const Module = ({ testimonials, articles, scoreStats }: ModuleProps) => {
  return (
    <Main
      testimonials={testimonials}
      articles={articles}
      scoreStats={scoreStats}
    />
  );
};
