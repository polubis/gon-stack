import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ImageProps = ComponentProps<'img'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Image = ({ className, ...props }: ImageProps) => {
  return <img className={cn('block', className)} {...props} />;
};
