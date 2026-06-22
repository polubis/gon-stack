import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type AlertProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary' | 'success' | 'error';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Alert = ({
  variant = 'primary',
  className,
  ...props
}: AlertProps) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3',
        'w-full px-4 py-3',
        'rounded-xl border',
        'text-sm',
        variant === 'primary' && [
          'border-(--alert-primary-border)',
          'bg-(--alert-primary-bg)',
          'text-(--alert-primary-text)',
        ],
        variant === 'secondary' && [
          'border-(--alert-secondary-border)',
          'bg-(--alert-secondary-bg)',
          'text-(--alert-secondary-text)',
        ],
        variant === 'success' && [
          'border-(--alert-success-border)',
          'bg-(--alert-success-bg)',
          'text-(--alert-success-text)',
        ],
        variant === 'error' && [
          'border-(--alert-error-border)',
          'bg-(--alert-error-bg)',
          'text-(--alert-error-text)',
        ],
        className,
      )}
      {...props}
    />
  );
};
