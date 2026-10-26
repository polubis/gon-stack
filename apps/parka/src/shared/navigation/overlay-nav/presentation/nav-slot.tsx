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
 * (no focus, no reading). Motion is off under `motion-reduce`. The side nav
 * (desktop) is never touched.
 */
export const NavSlot = ({ placement, children }: Props) => {
  const { hidden } = useContext();

  if (placement === 'side')
    return (
      <div className="z-(--z-nav) hidden h-full w-64 shrink-0 lg:block xl:w-72">
        {children}
      </div>
    );

  return (
    <div
      inert={hidden}
      aria-hidden={hidden || undefined}
      data-overlay-hidden={hidden}
      className={cn(
        'z-(--z-nav) grid shrink-0 overflow-hidden transition-[grid-template-rows,opacity,translate] duration-200 ease-out motion-reduce:transition-none lg:hidden',
        hidden
          ? 'grid-rows-[0fr] translate-y-full opacity-0'
          : 'grid-rows-[1fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
};
