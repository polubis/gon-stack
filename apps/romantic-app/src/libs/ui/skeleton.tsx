import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SkeletonProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Skeleton = ({
  variant: _variant,
  className,
  ...props
}: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-lg',
        'bg-(--skeleton-bg)',
        className,
      )}
      {...props}
    />
  );
};
