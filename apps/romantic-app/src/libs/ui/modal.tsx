import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ModalProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const Modal = ({ className, ...props }: ModalProps) => {
  return (
    <div
      role="dialog"
      className={cn(
        'fixed inset-0 flex items-center justify-center',
        className,
      )}
      {...props}
    />
  );
};
