import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type VideoProps = ComponentProps<'video'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Video = ({ className, ...props }: VideoProps) => {
  return <video className={cn('block', className)} {...props} />;
};
