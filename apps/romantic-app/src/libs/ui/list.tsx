import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ListProps = ComponentProps<'ul'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const List = ({ className, ...props }: ListProps) => {
  return <ul className={cn('flex flex-col', className)} {...props} />;
};
