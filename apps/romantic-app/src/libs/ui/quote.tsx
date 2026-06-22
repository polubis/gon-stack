import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type QuoteProps = ComponentProps<'blockquote'> & {
  variant?: 'primary' | 'secondary';
  cite?: string;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Quote = ({
  variant = 'primary',
  cite,
  className,
  children,
  ...props
}: QuoteProps) => {
  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      <blockquote
        className={cn(
          'relative px-5 py-4',
          'border-l-4 rounded-r-xl',
          'transition-all duration-160 ease-in-out',
          variant === 'primary' && [
            'border-(--quote-primary-border)',
            'bg-(--quote-primary-bg)',
            'text-(--quote-primary-text)',
          ],
          variant === 'secondary' && [
            'border-(--quote-secondary-border)',
            'bg-(--quote-secondary-bg)',
            'text-(--quote-secondary-text)',
          ],
        )}
        {...props}
      >
        <span className="o1 italic">{children}</span>
      </blockquote>
      {cite && (
        <figcaption
          className={cn(
            'c1 pl-6',
            variant === 'primary' && 'text-(--quote-primary-cite)',
            variant === 'secondary' && 'text-(--quote-secondary-cite)',
          )}
        >
          — {cite}
        </figcaption>
      )}
    </figure>
  );
};
