import type { ComponentProps } from 'react';
import { cn } from '@repo/react-kit/cn';

/**
 * Zero-height sticky rail for a floating button. When the bottom nav hides or
 * returns (`data-nav-collapsed` on the root, set by NavSlot), the layout under the
 * rail shifts by the nav height in one step; the rail glides over that distance
 * (transform only) instead of jumping. No motion on first render, none under
 * `motion-reduce`.
 */
export const NavFollow = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    {...props}
    className={cn(
      'will-change-transform motion-reduce:animate-none',
      '[:root[data-nav-collapsed=true]_&]:animate-nav-follow-hide [:root[data-nav-collapsed=false]_&]:animate-nav-follow-show',
      className,
    )}
  />
);
