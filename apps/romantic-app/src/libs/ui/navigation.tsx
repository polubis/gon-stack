import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type NavigationProps = ComponentProps<'nav'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Navigation = ({ className, ...props }: NavigationProps) => {
  return <nav className={cn('flex items-center', className)} {...props} />;
};
