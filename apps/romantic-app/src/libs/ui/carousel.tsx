import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type CarouselProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Carousel = ({ className, ...props }: CarouselProps) => {
  return (
    <div className={cn('relative overflow-hidden', className)} {...props} />
  );
};
