import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type IconProps = ComponentProps<'span'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Icon = ({ className, ...props }: IconProps) => {
  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    />
  );
};
