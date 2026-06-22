import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type DropdownMenuProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const DropdownMenu = ({ className, ...props }: DropdownMenuProps) => {
  return <div className={cn('relative inline-block', className)} {...props} />;
};
