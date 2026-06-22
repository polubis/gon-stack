import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type HeroProps = ComponentProps<'section'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Hero = ({ className, ...props }: HeroProps) => {
  return (
    <section
      className={cn('flex flex-col items-center justify-center', className)}
      {...props}
    />
  );
};
