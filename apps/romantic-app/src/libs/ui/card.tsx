import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type CardProps = ComponentProps<'div'>;

/* =============================================================================
 * Component
 * ============================================================================= */

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-(--card-border) bg-(--card-bg) shadow-(--card-shadow)',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
