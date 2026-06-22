import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type LinkProps = ComponentProps<'a'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Link = ({
  variant = 'primary',
  className,
  ...props
}: LinkProps) => {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-1',
        'text-sm font-medium underline-offset-4',
        'transition-colors duration-160 ease-in-out',
        'outline-none',
        'focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-(--link-focus)',
        variant === 'primary' && [
          'text-(--link-primary-text)',
          'hover:text-(--link-primary-text-hover) hover:underline',
        ],
        variant === 'secondary' && [
          'text-(--link-secondary-text)',
          'hover:text-(--link-secondary-text-hover) hover:underline',
        ],
        className,
      )}
      {...props}
    />
  );
};
