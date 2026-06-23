import { Main } from '@/modules/home/presentation/main';
import type { Testimonial } from '@/modules/home/domain/models';

type ModuleProps = {
  testimonials: Testimonial[];
};

export const Module = ({ testimonials }: ModuleProps) => {
  return <Main testimonials={testimonials} />;
};
