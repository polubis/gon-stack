import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SkipLinkProps = ComponentProps<'a'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const SkipLink = ({
  variant = 'primary',
  className,
  ...props
}: SkipLinkProps) => {
  return (
    <a
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:left-4 focus:top-4 focus:z-[9999]',
        'focus:inline-flex focus:items-center',
        'focus:px-4 focus:py-2',
        'focus:rounded-(--skip-link-radius)',
        'focus:text-sm focus:font-semibold',
        'focus:outline-none focus:ring-2 focus:ring-(--skip-link-focus)',
        'focus:transition-none',
        variant === 'primary' && [
          'focus:border focus:border-(--skip-link-primary-border)',
          'focus:bg-(--skip-link-primary-bg)',
          'focus:text-(--skip-link-primary-text)',
        ],
        variant === 'secondary' && [
          'focus:border focus:border-(--skip-link-secondary-border)',
          'focus:bg-(--skip-link-secondary-bg)',
          'focus:text-(--skip-link-secondary-text)',
        ],
        className,
      )}
      {...props}
    />
  );
};
