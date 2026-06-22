import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SeparatorProps = ComponentProps<'hr'> & {
  variant?: 'primary' | 'secondary';
  orientation?: 'horizontal' | 'vertical';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Separator = ({
  variant,
  orientation = 'horizontal',
  className,
  ...props
}: SeparatorProps) => {
  return (
    <hr
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal' && 'w-full border-t',
        orientation === 'vertical' && 'h-full border-l self-stretch',
        !variant && 'border-(--separator-default)',
        variant === 'primary' && 'border-(--separator-primary)',
        variant === 'secondary' && 'border-(--separator-secondary)',
        className,
      )}
      {...props}
    />
  );
};
