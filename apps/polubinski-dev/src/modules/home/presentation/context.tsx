import { context } from '@repo/react-kit/context';
import { FEATURE_NAME } from '../configuration/constraints';
import type { Article, ScoreStats, Testimonial } from '../domain/models';

type HomeContextValue = {
  testimonials: Testimonial[];
  articles: Article[];
  scoreStats: ScoreStats | null;
};

export const [Provider, useContext] = context(
  FEATURE_NAME,
  ({ testimonials, articles, scoreStats }: HomeContextValue) => ({
    testimonials,
    articles,
    scoreStats,
  }),
);
