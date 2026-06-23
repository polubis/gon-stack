import { createHookContext } from '@repo/react-kit/context';
import { FEATURE_NAME } from '../configuration/constraints';
import type { Testimonial } from '../domain/models';

type HomeContextValue = {
  testimonials: Testimonial[];
};

export const [Provider, useContext] = createHookContext(
  FEATURE_NAME,
  ({ testimonials }: HomeContextValue) => ({ testimonials }),
);
