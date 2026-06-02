import { type ComponentProps } from 'react';

import { cn } from './cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';

export type ButtonProps = (
  | (ComponentProps<'button'> & { href?: never })
  | (ComponentProps<'a'> & { href: string })
) & { variant?: ButtonVariant };

/* =============================================================================
 * Component
 * ============================================================================= */

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  const classes = cn(
    'inline-flex items-center justify-center gap-2',
    'text-sm',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary' && [
      'rounded-pill px-5.5 py-3 font-medium',
      'bg-primary text-on-primary border-0',
    ],
    variant === 'secondary' && [
      'rounded-pill px-5.5 py-3 font-medium',
      'bg-transparent text-ink border border-card-border',
      'hover:border-ink',
      'disabled:border-card-border',
    ],
    variant === 'tertiary' && [
      'bg-canvas border border-card-border-c rounded-full px-4 py-2 text-ink text-sm hover:bg-coral hover:text-white hover:border-coral transition-colors',
    ],
    variant === 'ghost' && [
      'bg-transparent text-ink border-0 p-0',
      'border-b border-ink pb-0.5',
      'hover:text-coral hover:border-coral',
    ],
    className,
  );

  if ('href' in props && props.href !== undefined) {
    return <a className={classes} {...(props as ComponentProps<'a'>)} />;
  }

  return (
    <button className={classes} {...(props as ComponentProps<'button'>)} />
  );
};
