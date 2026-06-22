import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type EmptyStateProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const EmptyState = ({ className, ...props }: EmptyStateProps) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center', className)}
      {...props}
    />
  );
};
