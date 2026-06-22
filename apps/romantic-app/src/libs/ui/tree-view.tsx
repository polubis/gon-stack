import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type TreeViewProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const TreeView = ({ className, ...props }: TreeViewProps) => {
  return (
    <div role="tree" className={cn('flex flex-col', className)} {...props} />
  );
};
