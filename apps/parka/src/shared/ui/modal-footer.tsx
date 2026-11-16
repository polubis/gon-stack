import type { ComponentProps } from 'react';
import { cn } from '@repo/react-kit/cn';

/**
 * Frame padding of a modal: `p-5`, but the bottom padding is dropped while a
 * `ModalFooter` is inside, so the sticky footer sits flush with the frame edge
 * and nothing scrolls into view below it. The footer carries the bottom space.
 */
export const MODAL_PADDING = 'p-5 has-[[data-modal-footer]]:pb-0';

/**
 * Footer of a modal: always sticky, solid card background, soft fade on its top edge.
 * Last child of the frame, which uses `MODAL_PADDING`. Its bottom corners carry the
 * frame radius (`rounded-b-4xl`), so it never pokes out of the round corners, also in
 * frames without `overflow`; clipping the frame would cut focus rings. Its own bottom
 * padding keeps the buttons off the edge and clear of the device safe area.
 */
export const ModalFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-modal-footer=""
    className={cn(
      'sticky bottom-0 z-(--z-raised) -mx-5 mt-4 rounded-b-4xl bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-4 before:bg-linear-to-t before:from-card before:to-transparent',
      className,
    )}
    {...props}
  />
);
