import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SpinnerProps = ComponentProps<'span'> & {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Spinner = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full',
        'border-2 border-transparent',
        size === 'sm' && 'size-4',
        size === 'md' && 'size-6',
        size === 'lg' && 'size-8',
        variant === 'primary' && [
          'border-t-(--spinner-primary-color)',
          'border-r-(--spinner-primary-color)',
          'shadow-(color:--spinner-primary-glow)',
        ],
        variant === 'secondary' && [
          'border-t-(--spinner-secondary-color)',
          'border-r-(--spinner-secondary-color)',
          'shadow-(color:--spinner-secondary-glow)',
        ],
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading…</span>
    </span>
  );
};
