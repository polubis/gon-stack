import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ToastProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary' | 'success' | 'error';
};

export type ToastTitleProps = ComponentProps<'p'>;
export type ToastDescriptionProps = ComponentProps<'p'>;
export type ToastCloseProps = ComponentProps<'button'>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const ToastRoot = ({
  variant = 'primary',
  className,
  children,
  ...props
}: ToastProps) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3',
        'w-full max-w-sm px-4 py-3',
        'rounded-(--toast-radius)',
        'border',
        'shadow-lg',
        'transition-all duration-200',
        variant === 'primary' && [
          'border-(--toast-primary-border)',
          'bg-(--toast-primary-bg)',
          'shadow-(color:--toast-primary-glow)',
        ],
        variant === 'secondary' && [
          'border-(--toast-secondary-border)',
          'bg-(--toast-secondary-bg)',
          'shadow-(color:--toast-secondary-glow)',
        ],
        variant === 'success' && [
          'border-(--toast-success-border)',
          'bg-(--toast-success-bg)',
          'shadow-(color:--toast-success-glow)',
        ],
        variant === 'error' && [
          'border-(--toast-error-border)',
          'bg-(--toast-error-bg)',
          'shadow-(color:--toast-error-glow)',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/* =============================================================================
 * Content
 * ============================================================================= */

export const ToastContent = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div className={cn('flex flex-1 flex-col gap-0.5', className)} {...props} />
  );
};

/* =============================================================================
 * Title
 * ============================================================================= */

export const ToastTitle = ({ className, ...props }: ToastTitleProps) => {
  return (
    <p
      className={cn(
        'text-sm font-semibold text-(--toast-title-text)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Description
 * ============================================================================= */

export const ToastDescription = ({
  className,
  ...props
}: ToastDescriptionProps) => {
  return (
    <p
      className={cn('text-xs text-(--toast-description-text)', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Close
 * ============================================================================= */

export const ToastClose = ({
  className,
  children,
  ...props
}: ToastCloseProps) => {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      className={cn(
        'ml-auto shrink-0 self-start',
        'inline-flex size-5 items-center justify-center',
        'rounded-md',
        'text-(--toast-close-text)',
        'transition-colors duration-160',
        'hover:text-(--toast-close-text-hover)',
        'outline-none focus-visible:ring-2 focus-visible:ring-(--toast-close-focus)',
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Toast = {
  Root: ToastRoot,
  Content: ToastContent,
  Title: ToastTitle,
  Description: ToastDescription,
  Close: ToastClose,
};
