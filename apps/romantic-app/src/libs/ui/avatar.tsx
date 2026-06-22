import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type AvatarProps = ComponentProps<'span'> & {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
  initials?: string;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Avatar = ({
  variant = 'primary',
  size = 'md',
  src,
  alt = '',
  initials,
  className,
  children,
  ...props
}: AvatarProps) => {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        'rounded-full overflow-hidden',
        'border-2',
        'font-semibold select-none',
        size === 'sm' && 'size-8 text-xs',
        size === 'md' && 'size-10 text-sm',
        size === 'lg' && 'size-14 text-base',
        variant === 'primary' && [
          'border-(--avatar-border)',
          'bg-(--avatar-bg)',
          'text-(--avatar-text)',
        ],
        variant === 'secondary' && [
          'border-(--avatar-secondary-border)',
          'bg-(--avatar-secondary-bg)',
          'text-(--avatar-text)',
        ],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        (children ?? initials ?? null)
      )}
    </span>
  );
};
