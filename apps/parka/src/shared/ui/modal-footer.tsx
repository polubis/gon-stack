import type { ComponentProps } from 'react';
import { cn } from '@repo/react-kit/cn';

/**
 * Footer of a modal: always sticky, solid card background, soft fade on its top edge.
 * Expects a `p-5` dialog, it bleeds over the padding to sit flush with the frame.
 */
export const ModalFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(
      'sticky bottom-0 z-(--z-raised) -mx-5 -mb-5 mt-4 bg-card px-5 pb-5 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-4 before:bg-linear-to-t before:from-card before:to-transparent',
      className,
    )}
    {...props}
  />
);
