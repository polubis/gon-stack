import type { ReactNode } from 'react';
import { cn } from '@repo/react-kit/cn';
import { useContext } from './context';

type Props = {
  placement: 'side' | 'bottom';
  children: ReactNode;
};

/**
 * Holds the app nav. The bottom nav (mobile only) slides away while an
 * overlay is open, so the overlay gets the whole screen; hidden it is inert
 * (no focus, no reading). Only opacity and translate animate (compositor);
 * the rows collapse as one discrete step after the slide, so content reflows
 * once instead of every frame. Motion is off under `motion-reduce`. The side nav
 * (desktop) is never touched.
 */
export const NavSlot = ({ placement, children }: Props) => {
  const { hidden } = useContext();

  if (placement === 'side')
    return (
      <div className="z-(--z-raised) hidden h-full w-64 shrink-0 lg:block xl:w-72">
        {children}
      </div>
    );

  return (
    <div
      inert={hidden}
      aria-hidden={hidden || undefined}
      data-overlay-hidden={hidden}
      className={cn(
        'z-(--z-raised) grid shrink-0 overflow-hidden ease-out [transition-property:grid-template-rows,opacity,translate] [transition-duration:0s,200ms,200ms] motion-reduce:transition-none lg:hidden',
        hidden
          ? 'grid-rows-[0fr] translate-y-full opacity-0 [transition-delay:200ms,0s,0s]'
          : 'grid-rows-[1fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
};
