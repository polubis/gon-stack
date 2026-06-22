import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type TooltipProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Tooltip = ({ className, ...props }: TooltipProps) => {
  return <div className={cn('relative inline-block', className)} {...props} />;
};
