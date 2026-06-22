import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type DatepickerProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Datepicker = ({ className, ...props }: DatepickerProps) => {
  return <div className={cn('relative inline-block', className)} {...props} />;
};
